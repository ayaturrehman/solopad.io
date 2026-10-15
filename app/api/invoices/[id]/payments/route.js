import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requirePermission } from "@/lib/permissions";
import { getTenantFilter } from "@/lib/tenant";
import { requireStripe } from "@/lib/stripe";
import { invoicePaymentAmount } from "@/lib/invoice-payment";
import {
  withInvoiceLock,
  requirePayable,
  retireInvoiceCheckouts,
  applyReceipt,
  paymentError,
} from "@/lib/invoice-receipts";
import db from "@/lib/db";
export async function POST(req, { params }) {
  const { session, error, status } = await requirePermission("manage_invoices");
  if (error) return NextResponse.json({ error }, { status });
  try {
    const { id } = await params;
    const filter = await getTenantFilter(session);
    const allowed = await db.invoice.findFirst({
      where: { id, project: filter },
      select: { id: true },
    });
    if (!allowed)
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    const body = await req.json();
    if (body.confirmed !== true)
      throw paymentError(
        "Confirm that the funds have reached your bank account.",
        400,
      );
    if (
      typeof body.idempotencyKey !== "string" ||
      !/^[a-zA-Z0-9-]{16,80}$/.test(body.idempotencyKey)
    )
      throw paymentError("A valid payment request ID is required.", 400);
    const date = new Date(body.receivedAt);
    if (
      !body.receivedAt ||
      !Number.isFinite(date.getTime()) ||
      date > new Date()
    )
      throw paymentError(
        "Enter a valid receipt date that is not in the future.",
        400,
      );
    if (
      typeof body.reference !== "string" ||
      body.reference.trim().length > 150
    )
      throw paymentError("Reference must be at most 150 characters.", 400);
    const result = await withInvoiceLock(db, id, async (tx, invoice) => {
      const key = `bank-${id}-${body.idempotencyKey}`;
      const prior = await tx.invoicePayment.findUnique({
        where: { idempotencyKey: key },
      });
      if (prior) {
        if (
          prior.amount !== Number(body.amount) ||
          prior.milestoneId !== (body.milestoneId || null)
        )
          throw paymentError(
            "Request ID was already used for another payment.",
          );
        return invoice;
      }
      requirePayable(invoice);
      if (!invoice.project.user.bankTransferEnabled)
        throw paymentError("Enable bank transfers in payment settings first.");
      const amount = Number(body.amount);
      let rounded;
      try {
        rounded = invoicePaymentAmount({
          total: amount,
          currency: invoice.currency,
        });
      } catch (err) {
        throw paymentError(err.message, 400);
      }
      const one = invoicePaymentAmount({
        total: 1,
        currency: invoice.currency,
      }).amount;
      if (Math.abs(rounded.amount / one - amount) > 0.000001)
        throw paymentError("Amount has too many decimal places.", 400);
      if (invoice.paymentPlans.length && !body.milestoneId)
        throw paymentError(
          "Choose the milestone this payment belongs to.",
          400,
        );
      // No Stripe connection is needed for a bank-only invoice.
      const hasLinks =
        invoice.stripeSessionId ||
        (await tx.invoicePayment.count({
          where: { invoiceId: id, method: "stripe", status: "pending" },
        }));
      await retireInvoiceCheckouts(
        tx,
        invoice,
        hasLinks ? requireStripe() : null,
      );
      const updated = await applyReceipt(tx, invoice, {
        amount,
        milestoneId: body.milestoneId || null,
        receivedAt: date,
      });
      await tx.invoicePayment.create({
        data: {
          invoiceId: id,
          milestoneId: body.milestoneId || null,
          method: "bank_transfer",
          amount,
          currency: invoice.currency,
          receivedAt: date,
          reference: body.reference.trim() || null,
          recordedById: session.user.id,
          idempotencyKey: key,
        },
      });
      return updated;
    });
    for (const path of ["/dashboard", "/finance", `/invoices/${id}`])
      revalidatePath(path);
    return NextResponse.json(result);
  } catch (err) {
    console.error("[Record bank payment]", err.message);
    return NextResponse.json(
      {
        error: err.status
          ? err.message
          : "Unable to record payment. Please try again.",
      },
      { status: err.status || 500 },
    );
  }
}
