import { NextResponse } from "next/server";
import { requireStripe } from "@/lib/stripe";
import db from "@/lib/db";
import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

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
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_BILLING_WEBHOOK_SECRET);
  } catch (err) {
    console.error("[Billing Webhook] Signature failed:", err.message);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "customer.subscription.created":
      case "customer.subscription.updated":
        await handleSubscriptionChange(event.data.object);
        break;

      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(event.data.object);
        break;

      case "invoice.payment_succeeded":
        await handlePaymentSucceeded(event.data.object);
        break;

      case "invoice.payment_failed":
        await handlePaymentFailed(event.data.object);
        break;

      case "customer.subscription.trial_will_end":
        await handleTrialEnding(event.data.object);
        break;

      default:
        console.log(`[Billing Webhook] Unhandled: ${event.type}`);
    }
  } catch (err) {
    console.error(`[Billing Webhook] Error in ${event.type}:`, err);
    return NextResponse.json({ received: true, error: err.message });
  }

  return NextResponse.json({ received: true });
}

// ─── Subscription created or updated ────────────────────────────
async function handleSubscriptionChange(sub) {
  const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer?.id;
  if (!customerId) return;

  const subscription = await db.subscription.findUnique({
    where: { stripeCustomerId: customerId },
  });
  if (!subscription) return;

  const plan = sub.metadata?.plan || mapPriceIdToPlan(sub.items?.data?.[0]?.price?.id);

  await db.subscription.update({
    where: { id: subscription.id },
    data: {
      stripeSubscriptionId: sub.id,
      stripePriceId: sub.items?.data?.[0]?.price?.id || null,
      plan: plan || subscription.plan,
      status: sub.status, // active | past_due | trialing | incomplete | canceled
      currentPeriodStart: sub.current_period_start ? new Date(sub.current_period_start * 1000) : null,
      currentPeriodEnd: sub.current_period_end ? new Date(sub.current_period_end * 1000) : null,
      cancelAtPeriodEnd: sub.cancel_at_period_end || false,
      trialEnd: sub.trial_end ? new Date(sub.trial_end * 1000) : null,
    },
  });

  // Sync Business.plan
  if (plan) {
    await db.business.update({
      where: { id: subscription.businessId },
      data: { plan },
    });
  }
}

// ─── Subscription deleted (canceled) ────────────────────────────
async function handleSubscriptionDeleted(sub) {
  const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer?.id;
  if (!customerId) return;

  const subscription = await db.subscription.findUnique({
    where: { stripeCustomerId: customerId },
    include: { business: { select: { ownerId: true } } },
  });
  if (!subscription) return;

  await db.subscription.update({
    where: { id: subscription.id },
    data: {
      plan: "free",
      status: "canceled",
      stripeSubscriptionId: null,
      stripePriceId: null,
      cancelAtPeriodEnd: false,
    },
  });

  await db.business.update({
    where: { id: subscription.businessId },
    data: { plan: "free" },
  });

  // Notify the owner
  if (subscription.business?.ownerId) {
    await db.notification.create({
      data: {
        userId: subscription.business.ownerId,
        businessId: subscription.businessId,
        type: "subscription_canceled",
        title: "Subscription ended",
        body: "Your plan has been downgraded to Free. Upgrade anytime to restore features.",
        link: "/settings",
      },
    });
  }
}

// ─── Invoice payment succeeded ──────────────────────────────────
async function handlePaymentSucceeded(invoice) {
  // Only handle subscription invoices (not one-time payments)
  if (!invoice.subscription) return;

  const customerId = typeof invoice.customer === "string" ? invoice.customer : invoice.customer?.id;
  if (!customerId) return;

  const subscription = await db.subscription.findUnique({
    where: { stripeCustomerId: customerId },
    include: { business: { select: { ownerId: true } } },
  });
  if (!subscription) return;

  // If status was past_due, it's now resolved
  if (subscription.status === "past_due") {
    await db.subscription.update({
      where: { id: subscription.id },
      data: { status: "active" },
    });
  }
}

// ─── Invoice payment failed ─────────────────────────────────────
async function handlePaymentFailed(invoice) {
  if (!invoice.subscription) return;

  const customerId = typeof invoice.customer === "string" ? invoice.customer : invoice.customer?.id;
  if (!customerId) return;

  const subscription = await db.subscription.findUnique({
    where: { stripeCustomerId: customerId },
    include: { business: { select: { ownerId: true } } },
  });
  if (!subscription) return;

  await db.subscription.update({
    where: { id: subscription.id },
    data: { status: "past_due" },
  });

  // Notify owner
  if (subscription.business?.ownerId) {
    await db.notification.create({
      data: {
        userId: subscription.business.ownerId,
        businessId: subscription.businessId,
        type: "payment_failed",
        title: "Payment failed",
        body: "We could not process your subscription payment. Update your payment method to keep your plan active.",
        link: "/settings",
      },
    });

    // Send email
    if (resend) {
      const user = await db.user.findUnique({ where: { id: subscription.business.ownerId }, select: { email: true } });
      if (user?.email) {
        try {
          await resend.emails.send({
            from: process.env.FROM_EMAIL,
            to: user.email,
            subject: "Action needed: payment failed for your SoloPad plan",
            html: `<p>We could not process your subscription payment.</p><p>Please update your payment method in <a href="${process.env.NEXT_PUBLIC_APP_URL}/settings">Settings</a> to keep your plan active.</p>`,
          });
        } catch {
          // non-fatal
        }
      }
    }
  }
}

// ─── Trial ending soon (3 days before) ──────────────────────────
async function handleTrialEnding(sub) {
  const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer?.id;
  if (!customerId) return;

  const subscription = await db.subscription.findUnique({
    where: { stripeCustomerId: customerId },
    include: { business: { select: { ownerId: true } } },
  });
  if (!subscription) return;

  if (subscription.business?.ownerId) {
    await db.notification.create({
      data: {
        userId: subscription.business.ownerId,
        businessId: subscription.businessId,
        type: "trial_ending",
        title: "Trial ending soon",
        body: "Your free trial ends in 3 days. Add a payment method to continue on your current plan.",
        link: "/settings",
      },
    });
  }
}

// ─── Helper: map Stripe price ID back to plan name ──────────────
function mapPriceIdToPlan(priceId) {
  if (!priceId) return null;
  const soloMonthly = process.env.STRIPE_PRICE_SOLO_MONTHLY;
  const soloYearly = process.env.STRIPE_PRICE_SOLO_YEARLY;
  const proMonthly = process.env.STRIPE_PRICE_PRO_MONTHLY;
  const proYearly = process.env.STRIPE_PRICE_PRO_YEARLY;

  if (priceId === soloMonthly || priceId === soloYearly) return "solo";
  if (priceId === proMonthly || priceId === proYearly) return "pro";
  return null;
}
