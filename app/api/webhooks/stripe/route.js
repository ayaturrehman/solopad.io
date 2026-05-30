import { NextResponse } from "next/server";
import { requireStripe } from "@/lib/stripe";
import db from "@/lib/db";
import { sendNotificationEmail } from "@/lib/email";
import { isEventProcessed, markEventProcessed } from "@/lib/webhook-events";

export async function POST(req) {
  let stripe;
  try {
    stripe = requireStripe();
  } catch {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 500 });
  }

  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error("[Webhook] Signature verification failed:", err.message);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  // Idempotency: skip events we've already handled (Stripe retries / re-sends).
  if (await isEventProcessed(event.id)) {
    return NextResponse.json({ received: true, duplicate: true });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutCompleted(event.data.object);
        break;

      case "checkout.session.expired":
        await handleCheckoutExpired(event.data.object);
        break;

      case "charge.refunded":
        await handleChargeRefunded(event.data.object);
        break;

      case "charge.dispute.created":
        await handleDisputeCreated(event.data.object);
        break;

      case "account.updated":
        await handleAccountUpdated(event.data.object);
        break;

      default:
        // Unhandled event type — log and acknowledge
        console.log(`[Webhook] Unhandled event: ${event.type}`);
    }
  } catch (err) {
    console.error(`[Webhook] Error handling ${event.type}:`, err);
    // Return 200 to prevent Stripe from retrying (we logged the error)
    return NextResponse.json({ received: true, error: err.message });
  }

  // Record only after successful handling so failed events can be retried.
  await markEventProcessed(event.id, { type: event.type, source: "connect" });

  return NextResponse.json({ received: true });
}

// ─── checkout.session.completed ─────────────────────────────────
async function handleCheckoutCompleted(session) {
  const { invoiceId, milestoneId } = session.metadata || {};
  if (!invoiceId) return;

  // Handle milestone-specific payment
  if (milestoneId) {
    await handleMilestonePayment(invoiceId, milestoneId, session.payment_intent);
    return;
  }

  // Idempotency: skip if already paid
  const existing = await db.invoice.findUnique({ where: { id: invoiceId }, select: { status: true } });
  if (existing?.status === "paid") return;

  const invoice = await db.invoice.update({
    where: { id: invoiceId },
    data: {
      status: "paid",
      paidAt: new Date(),
      stripePaymentIntentId: session.payment_intent,
    },
    include: { project: { include: { user: true, contact: { select: { name: true } } } } },
  });

  // In-app notification
  if (invoice.project?.user?.id) {
    await db.notification.create({
      data: {
        userId: invoice.project.user.id,
        businessId: invoice.project.user.businessId,
        type: "invoice_paid",
        title: "Payment received",
        body: `${invoice.project.contact?.name || "Client"} paid $${invoice.total.toFixed(2)} for "${invoice.project.title}"`,
        link: `/projects/${invoice.project.id}`,
      },
    });
  }

  // Email notification (respects notification preferences)
  if (invoice.project?.user?.email) {
    await sendNotificationEmail({
      businessId: invoice.project.user.businessId,
      type: "payment_received",
      to: invoice.project.user.email,
      variables: {
        clientName: invoice.project.contact?.name || "Client",
        amount: `$${invoice.total.toFixed(2)}`,
        projectTitle: invoice.project.title,
      },
    });
  }
}

// ─── checkout.session.expired ───────────────────────────────────
// Client started checkout but didn't complete it. Clean up the session ID.
async function handleCheckoutExpired(session) {
  const { invoiceId } = session.metadata || {};
  if (!invoiceId) return;

  await db.invoice.updateMany({
    where: { id: invoiceId, status: { not: "paid" } },
    data: { stripeSessionId: null },
  });
}

// ─── charge.refunded ────────────────────────────────────────────
// Payment was refunded (full or partial). Mark invoice and notify freelancer.
async function handleChargeRefunded(charge) {
  const paymentIntentId = charge.payment_intent;
  if (!paymentIntentId) return;

  const invoice = await db.invoice.findFirst({
    where: { stripePaymentIntentId: paymentIntentId },
    include: { project: { include: { user: true, contact: { select: { name: true } } } } },
  });
  if (!invoice) return;

  const refundedAmountCents = charge.amount_refunded || 0;
  const isFullRefund = refundedAmountCents >= Math.round(invoice.total * 100);

  // Update invoice status
  await db.invoice.update({
    where: { id: invoice.id },
    data: { status: isFullRefund ? "refunded" : "partially_refunded" },
  });

  // Notify freelancer
  if (invoice.project?.user?.id) {
    const refundAmount = (refundedAmountCents / 100).toFixed(2);
    await db.notification.create({
      data: {
        userId: invoice.project.user.id,
        businessId: invoice.project.user.businessId,
        type: "invoice_refunded",
        title: isFullRefund ? "Payment refunded" : "Partial refund processed",
        body: `$${refundAmount} refunded for "${invoice.project.title}" — ${invoice.project.contact?.name || "Client"}`,
        link: `/projects/${invoice.project.id}`,
      },
    });
  }

  // Email notification (respects notification preferences)
  if (invoice.project?.user?.email) {
    const refundAmount = (refundedAmountCents / 100).toFixed(2);
    await sendNotificationEmail({
      businessId: invoice.project.user.businessId,
      type: "refund_processed",
      to: invoice.project.user.email,
      variables: {
        amount: `$${refundAmount}`,
        projectTitle: invoice.project.title,
      },
    });
  }
}

// ─── charge.dispute.created ─────────────────────────────────────
// Client filed a dispute. Flag the invoice and alert the freelancer.
async function handleDisputeCreated(dispute) {
  const paymentIntentId = dispute.payment_intent;
  if (!paymentIntentId) return;

  const invoice = await db.invoice.findFirst({
    where: { stripePaymentIntentId: paymentIntentId },
    include: { project: { include: { user: true } } },
  });
  if (!invoice) return;

  // Notify freelancer urgently
  if (invoice.project?.user?.id) {
    await db.notification.create({
      data: {
        userId: invoice.project.user.id,
        businessId: invoice.project.user.businessId,
        type: "invoice_disputed",
        title: "Payment disputed",
        body: `A dispute was filed for $${invoice.total.toFixed(2)} on "${invoice.project.title}". Respond in Stripe Dashboard.`,
        link: `/projects/${invoice.project.id}`,
      },
    });
  }

  // Email with urgency (respects notification preferences)
  if (invoice.project?.user?.email) {
    await sendNotificationEmail({
      businessId: invoice.project.user.businessId,
      type: "dispute_alert",
      to: invoice.project.user.email,
      variables: {
        amount: `$${invoice.total.toFixed(2)}`,
        projectTitle: invoice.project.title,
      },
    });
  }
}

// ─── account.updated ────────────────────────────────────────────
// Connected account status changed. Re-check charges_enabled.
async function handleAccountUpdated(account) {
  const stripeAccountId = account.id;
  if (!stripeAccountId) return;

  const user = await db.user.findFirst({
    where: { stripeAccountId },
  });
  if (!user) return;

  const chargesEnabled = account.charges_enabled === true;

  // Only update if status actually changed
  if (user.stripeOnboarded !== chargesEnabled) {
    await db.user.update({
      where: { id: user.id },
      data: { stripeOnboarded: chargesEnabled },
    });
  }
}

// ─── Milestone payment ──────────────────────────────────────────
// Mark a specific milestone as paid. If all milestones for the invoice
// are now paid, auto-mark the parent invoice as paid.
async function handleMilestonePayment(invoiceId, milestoneId, paymentIntentId) {
  // Idempotency: skip if already paid
  const existing = await db.paymentPlan.findUnique({ where: { id: milestoneId }, select: { status: true } });
  if (existing?.status === "paid") return;

  // Mark milestone as paid
  await db.paymentPlan.update({
    where: { id: milestoneId },
    data: { status: "paid", paidAt: new Date() },
  });

  // Check if all milestones for this invoice are now paid
  const allMilestones = await db.paymentPlan.findMany({
    where: { invoiceId },
    select: { status: true },
  });

  const allPaid = allMilestones.length > 0 && allMilestones.every((m) => m.status === "paid");

  if (allPaid) {
    await db.invoice.update({
      where: { id: invoiceId },
      data: {
        status: "paid",
        paidAt: new Date(),
        stripePaymentIntentId: paymentIntentId,
      },
    });
  }

  // Fetch invoice for notification
  const invoice = await db.invoice.findUnique({
    where: { id: invoiceId },
    include: { project: { include: { user: true, contact: { select: { name: true } } } } },
  });

  if (invoice?.project?.user?.id) {
    const milestone = await db.paymentPlan.findUnique({ where: { id: milestoneId } });
    await db.notification.create({
      data: {
        userId: invoice.project.user.id,
        businessId: invoice.project.user.businessId,
        type: "milestone_paid",
        title: allPaid ? "All milestones paid!" : "Milestone payment received",
        body: allPaid
          ? `All payments completed for "${invoice.project.title}" — $${invoice.total.toFixed(2)} total`
          : `${invoice.project.contact?.name || "Client"} paid $${(milestone?.amount || 0).toFixed(2)} milestone for "${invoice.project.title}"`,
        link: `/projects/${invoice.project.id}`,
      },
    });
  }
}
