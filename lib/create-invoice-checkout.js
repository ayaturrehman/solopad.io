import { randomUUID } from "node:crypto";
import { requireStripe, calculatePlatformFee } from "./stripe";
import { invoicePaymentAmount } from "./invoice-payment";
import {
  remainingInvoiceAmount,
  remainingMilestoneAmount,
  withInvoiceLock,
  requirePayable,
  retireInvoiceCheckouts,
  paymentError,
} from "./invoice-receipts";
export async function createInvoiceCheckout(
  db,
  { invoiceId, milestoneId, token },
) {
  let stripe;
  let created;
  try {
    return await withInvoiceLock(db, invoiceId, async (tx, invoice) => {
      if (!token || invoice.project.portalToken !== token)
        throw paymentError("Invoice not found.", 404);
      requirePayable(invoice);
      const freelancer = invoice.project.user;
      if (
        !freelancer?.stripeAccountId ||
        !freelancer.stripeOnboarded ||
        freelancer.stripePaymentsEnabled === false
      )
        throw paymentError(
          "Online payments are not available. Use bank transfer if offered, or contact the freelancer.",
        );
      stripe = requireStripe();
      const milestone = milestoneId
        ? invoice.paymentPlans.find((p) => p.id === milestoneId)
        : null;
      if (milestoneId && !milestone)
        throw paymentError("Milestone not found.", 404);
      if (!milestoneId && invoice.paymentPlans.length)
        throw paymentError("Pay an individual milestone instead.", 400);
      if (milestone?.status === "paid")
        throw paymentError("This milestone is already paid.", 400);
      const total = milestone
        ? remainingMilestoneAmount(milestone)
        : remainingInvoiceAmount(invoice);
      const { amount, currency } = invoicePaymentAmount({
        total,
        currency: invoice.currency,
      });
      await retireInvoiceCheckouts(tx, invoice, stripe);
      const appUrl =
        process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL;
      const returnTo = encodeURIComponent(
        `/p/${invoice.project.portalToken}?tab=invoices`,
      );
      const metadata = {
        invoiceId,
        paymentVersion: "2",
        ...(milestoneId ? { milestoneId } : {}),
      };
      // A new HTTP attempt gets a new key. Stripe SDK retries of this request
      // reuse it, but a DB rollback must not trap later retries on an expired link.
      const attemptKey = `invoice-balance-v3-${invoiceId}-${randomUUID()}`;
      created = await stripe.checkout.sessions.create(
        {
          mode: "payment",
          payment_method_types: (freelancer.paymentMethods || "card")
            .split(",")
            .filter((m) => ["card", "paypal", "klarna"].includes(m)),
          line_items: [
            {
              price_data: {
                currency,
                product_data: {
                  name:
                    milestone?.label ||
                    `Invoice ${invoice.invoiceNumber || invoice.id}`,
                  metadata,
                },
                unit_amount: amount,
              },
              quantity: 1,
            },
          ],
          customer_email:
            invoice.project.contact?.email ||
            invoice.project.clientEmail ||
            undefined,
          metadata,
          success_url: `${appUrl}/payment/success?invoiceId=${invoiceId}${milestoneId ? `&milestone=${milestoneId}` : ""}&session_id={CHECKOUT_SESSION_ID}&returnTo=${returnTo}`,
          cancel_url: `${appUrl}/payment/cancel?returnTo=${returnTo}`,
          payment_intent_data: {
            application_fee_amount: calculatePlatformFee(
              amount,
              freelancer.plan,
            ),
            transfer_data: { destination: freelancer.stripeAccountId },
          },
        },
        { idempotencyKey: attemptKey },
      );
      if (created.status !== "open" || !created.url || created.amount_total !== amount || created.currency !== currency)
        throw new Error("Checkout amount does not match invoice balance.");
      await tx.invoicePayment.create({
        data: {
          invoiceId,
          milestoneId: milestoneId || null,
          method: "stripe",
          status: "pending",
          amount: total,
          currency: invoice.currency,
          stripeSessionId: created.id,
          idempotencyKey: created.id,
        },
      });
      await tx.invoice.update({
        where: { id: invoiceId },
        data: { stripeSessionId: created.id },
      });
      return { url: created.url };
    });
  } catch (err) {
    if (created?.status === "open")
      await stripe.checkout.sessions.expire(created.id).catch(() => {});
    throw err;
  }
}
