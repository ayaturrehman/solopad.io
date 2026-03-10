import { NextResponse } from "next/server";
import Stripe from "stripe";
import db from "@/lib/db";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const STRIPE_METHOD_MAP = {
  card: "card",
  paypal: "paypal",
  klarna: "klarna",
};

export async function POST(req) {
  try {
    const { invoiceId } = await req.json();

    const invoice = await db.invoice.findUnique({
      where: { id: invoiceId },
      include: { project: { include: { user: true } } },
    });

    if (!invoice) return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    if (invoice.status === "paid") return NextResponse.json({ error: "Already paid" }, { status: 400 });

    const lineItems = typeof invoice.lineItems === "string"
      ? JSON.parse(invoice.lineItems)
      : invoice.lineItems;

    const freelancer = invoice.project?.user;

    // Payment methods
    const rawMethods = freelancer?.paymentMethods || "card";
    const paymentMethodTypes = rawMethods
      .split(",")
      .map((m) => STRIPE_METHOD_MAP[m.trim()])
      .filter(Boolean);

    // Build session options
    const sessionOptions = {
      payment_method_types: paymentMethodTypes.length ? paymentMethodTypes : ["card"],
      mode: "payment",
      line_items: lineItems.map((item) => ({
        price_data: {
          currency: invoice.currency.toLowerCase(),
          product_data: { name: item.description },
          unit_amount: Math.round(parseFloat(item.amount) * 100),
        },
        quantity: 1,
      })),
      customer_email: invoice.project?.clientEmail || undefined,
      metadata: { invoiceId },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/success?invoiceId=${invoiceId}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/cancel`,
    };

    // If the freelancer has connected their Stripe account, route payments to them
    if (freelancer?.stripeAccountId && freelancer?.stripeOnboarded) {
      const totalAmount = lineItems.reduce(
        (s, item) => s + Math.round(parseFloat(item.amount) * 100),
        0
      );
      // 2% platform fee (adjust as needed)
      const applicationFee = Math.round(totalAmount * 0.02);

      sessionOptions.payment_intent_data = {
        application_fee_amount: applicationFee,
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
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
