import { NextResponse } from "next/server";
import Stripe from "stripe";
import db from "@/lib/db";

const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;

export async function POST(req) {
  try {
    if (!stripe) {
      return NextResponse.json({ error: "Stripe is not configured." }, { status: 500 });
    }

    const { invoiceId } = await req.json();

    const invoice = await db.invoice.findUnique({
      where: { id: invoiceId },
      include: { project: { include: { user: true } } },
    });

    if (!invoice) return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    if (invoice.status === "paid") return NextResponse.json({ error: "Already paid" }, { status: 400 });
    if (invoice.status === "draft" || invoice.status === "cancelled") {
      return NextResponse.json({ error: "Invoice is not available for payment" }, { status: 400 });
    }

    const lineItems = typeof invoice.lineItems === "string"
      ? JSON.parse(invoice.lineItems)
      : invoice.lineItems;

    const freelancer = invoice.project?.user;
    const currency = invoice.currency?.toLowerCase() || "usd";

    // Build session options — use automatic_payment_methods (best practice)
    const sessionOptions = {
      mode: "payment",
      automatic_payment_methods: { enabled: true },
      line_items: lineItems.map((item) => ({
        price_data: {
          currency,
          product_data: {
            name: item.description || "Service",
            metadata: { invoiceId },
          },
          unit_amount: Math.round(parseFloat(item.unitPrice ?? item.amount) * 100),
        },
        quantity: parseInt(item.quantity, 10) || 1,
      })),
      customer_email: invoice.project?.clientEmail || undefined,
      metadata: { invoiceId },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/success?invoiceId=${invoiceId}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/cancel`,
    };

    // Route payments to the freelancer's connected Stripe account
    if (freelancer?.stripeAccountId && freelancer?.stripeOnboarded) {
      const totalAmount = lineItems.reduce((sum, item) => {
        const qty = parseInt(item.quantity, 10) || 1;
        const price = parseFloat(item.unitPrice ?? item.amount) || 0;
        return sum + Math.round(price * qty * 100);
      }, 0);

      // 2% platform fee
      const applicationFeeAmount = Math.round(totalAmount * 0.02);

      sessionOptions.payment_intent_data = {
        application_fee_amount: applicationFeeAmount,
        transfer_data: { destination: freelancer.stripeAccountId },
      };
    }

    const session = await stripe.checkout.sessions.create(sessionOptions);

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
