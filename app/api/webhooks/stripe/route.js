import { NextResponse } from "next/server";
import Stripe from "stripe";
import db from "@/lib/db";
import { Resend } from "resend";

const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function POST(req) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const { invoiceId } = session.metadata;

    const invoice = await db.invoice.update({
      where: { id: invoiceId },
      data: {
        status: "paid",
        paidAt: new Date(),
        stripePaymentIntentId: session.payment_intent,
      },
      include: { project: { include: { user: true, contact: { select: { name: true } } } } },
    });

    // Create in-app notification
    if (invoice.project?.user?.id) {
      await db.notification.create({
        data: {
          userId: invoice.project.user.id,
          type: "invoice_paid",
          title: "Payment received",
          body: `${invoice.project.contact?.name || "Client"} paid $${invoice.total.toFixed(2)} for "${invoice.project.title}"`,
          link: `/projects/${invoice.project.id}`,
        },
      });
    }

    // Send email notification
    if (invoice.project?.user?.email) {
      try {
        await resend.emails.send({
          from: process.env.FROM_EMAIL,
          to: invoice.project.user.email,
          subject: `Payment received for ${invoice.project.title}`,
          html: `<p>Your client <strong>${invoice.project.contact?.name || "Client"}</strong> paid <strong>$${invoice.total.toFixed(2)}</strong> for <strong>${invoice.project.title}</strong>.</p><p>Login to Solopad to view the details.</p>`,
        });
      } catch {
        // Email failure is non-fatal
      }
    }
  }

  return NextResponse.json({ received: true });
}
