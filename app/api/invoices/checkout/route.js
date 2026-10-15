import { NextResponse } from "next/server";
import { requireStripe, calculatePlatformFee } from "@/lib/stripe";
import db from "@/lib/db";
import { invoicePaymentAmount } from "@/lib/invoice-payment";
import { createHash } from "node:crypto";

export async function POST(req) {
  try {
    const stripe = requireStripe();
    const { invoiceId, token } = await req.json();

    if (!invoiceId) {
      return NextResponse.json({ error: "Invoice ID required" }, { status: 400 });
    }

    const invoice = await db.invoice.findUnique({
      where: { id: invoiceId },
      include: { project: { include: { user: { select: { id: true, stripeAccountId: true, stripeOnboarded: true, plan: true } } } } },
    });

    if (!invoice) return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    if (invoice.status === "paid") return NextResponse.json({ error: "Already paid" }, { status: 400 });
    if (invoice.status === "draft" || invoice.status === "cancelled") {
      return NextResponse.json({ error: "Invoice is not available for payment" }, { status: 400 });
    }

    const { currency, amount: totalAmountCents } = invoicePaymentAmount(invoice);

    // Safety net: if there's an existing checkout session, check if it was already paid
    // This prevents duplicate charges when the webhook fails to mark the invoice as paid
    if (invoice.stripeSessionId) {
      try {
        const existingSession = await stripe.checkout.sessions.retrieve(invoice.stripeSessionId);
        if (existingSession.payment_status === "paid") {
          // Webhook missed — mark as paid now and reject new checkout
          await db.invoice.update({
            where: { id: invoiceId },
            data: {
              status: "paid",
              paidAt: new Date(),
              stripePaymentIntentId: existingSession.payment_intent,
            },
          });
          return NextResponse.json({ error: "This invoice has already been paid." }, { status: 400 });
        }
        // Never leave the previously mispriced checkout open for payment.
        if (existingSession.status === "open") {
          await stripe.checkout.sessions.expire(existingSession.id);
        }
      } catch (err) {
        if (err.code !== "resource_missing") throw err;
      }
    }

    const freelancer = invoice.project?.user;

    // Build session options
    const sessionOptions = {
      mode: "payment",
      // Invoice.total is the persisted, displayed amount after tax and discounts.
      // A single invoice line also supports fractional service quantities without
      // reinterpreting legacy `amount` (a line total) as a unit price.
      line_items: [{
        price_data: {
          currency,
          product_data: { name: `Invoice ${invoice.invoiceNumber || invoiceId}`, metadata: { invoiceId } },
          unit_amount: totalAmountCents,
        },
        quantity: 1,
      }],
      customer_email: invoice.project?.clientEmail || undefined,
      metadata: { invoiceId },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/success?invoiceId=${invoiceId}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/cancel`,
    };

    // Route payments to the freelancer's connected Stripe account
    if (freelancer?.stripeAccountId && freelancer?.stripeOnboarded) {
      // Platform fee based on freelancer's plan tier
      const applicationFeeAmount = calculatePlatformFee(totalAmountCents, freelancer.plan);

      sessionOptions.payment_intent_data = {
        application_fee_amount: applicationFeeAmount,
        transfer_data: { destination: freelancer.stripeAccountId },
      };
    }

    const fingerprint = createHash("sha256").update(JSON.stringify({
      invoiceId, totalAmountCents, currency, updatedAt: invoice.updatedAt,
      previousSession: invoice.stripeSessionId, destination: freelancer?.stripeAccountId,
    })).digest("hex");
    const session = await stripe.checkout.sessions.create(sessionOptions, {
      idempotencyKey: `invoice-total-v2-${fingerprint}`,
    });
    if (session.amount_total !== totalAmountCents || session.currency !== currency) {
      await stripe.checkout.sessions.expire(session.id);
      throw new Error("Checkout amount does not match invoice total.");
    }

    await db.invoice.update({
      where: { id: invoiceId },
      data: { stripeSessionId: session.id },
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("[Checkout]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
