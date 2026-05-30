import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireStripe } from "@/lib/stripe";
import db from "@/lib/db";
import { isEventProcessed, markEventProcessed } from "@/lib/webhook-events";
import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function POST(req) {
  let stripe;
  try {
    stripe = requireStripe();
  } catch {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 500 });
  }

  const webhookSecret = process.env.STRIPE_BILLING_WEBHOOK_SECRET;
  if (!webhookSecret) {
    // Misconfiguration — the endpoint's live signing secret is missing from this
    // environment. Stripe will keep failing until it's set (Vercel → Settings →
    // Environment Variables → STRIPE_BILLING_WEBHOOK_SECRET for Production).
    console.error(
      "[Billing Webhook] STRIPE_BILLING_WEBHOOK_SECRET is not set — cannot verify events. " +
        "Add the signing secret for the /api/billing/webhook endpoint from the Stripe Dashboard."
    );
    return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 });
  }

  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err) {
    console.error("[Billing Webhook] Signature verification failed:", err.message);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  // Idempotency: skip events we've already handled (Stripe retries / re-sends).
  if (await isEventProcessed(event.id)) {
    return NextResponse.json({ received: true, duplicate: true });
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

      case "customer.subscription.trial_ended":
        await handleTrialEnded(event.data.object);
        break;

      default:
        console.log(`[Billing Webhook] Unhandled: ${event.type}`);
    }
  } catch (err) {
    console.error(`[Billing Webhook] Error in ${event.type}:`, err);
    return NextResponse.json({ received: true, error: err.message });
  }

  // Record only after successful handling so failed events can be retried.
  await markEventProcessed(event.id, { type: event.type, source: "billing" });

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

    await db.user.updateMany({
      where: { businessId: subscription.businessId },
      data: { plan },
    });
  }

  revalidateBillingViews();
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
      plan: "starter",
      status: "canceled",
      stripeSubscriptionId: null,
      stripePriceId: null,
      cancelAtPeriodEnd: false,
    },
  });

  await db.business.update({
    where: { id: subscription.businessId },
    data: { plan: "starter" },
  });

  await db.user.updateMany({
    where: { businessId: subscription.businessId },
    data: { plan: "starter" },
  });

  revalidateBillingViews();

  // Notify the owner
  if (subscription.business?.ownerId) {
    await db.notification.create({
      data: {
        userId: subscription.business.ownerId,
        businessId: subscription.businessId,
        type: "subscription_canceled",
        title: "Subscription ended",
        body: "Your plan has been downgraded to Starter. Upgrade anytime to restore features.",
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

  // If status was behind on payment or still trialing, activation is now confirmed
  if (subscription.status === "past_due" || subscription.status === "trialing" || subscription.status === "incomplete") {
    await db.subscription.update({
      where: { id: subscription.id },
      data: { status: "active", trialEnd: null },
    });

    revalidateBillingViews();
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

  revalidateBillingViews();

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

// ─── Trial ended ───────────────────────────────────────────────
async function handleTrialEnded(sub) {
  const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer?.id;
  if (!customerId) return;

  const subscription = await db.subscription.findUnique({
    where: { stripeCustomerId: customerId },
  });
  if (!subscription) return;

  await db.subscription.update({
    where: { id: subscription.id },
    data: {
      status: sub.status || "past_due",
      trialEnd: sub.trial_end ? new Date(sub.trial_end * 1000) : new Date(),
    },
  });

  revalidateBillingViews();
}

function revalidateBillingViews() {
  revalidatePath("/dashboard");
  revalidatePath("/pricing");
  revalidatePath("/settings");
  revalidatePath("/settings/billing");
}

// ─── Helper: map Stripe price ID back to plan name ──────────────
function mapPriceIdToPlan(priceId) {
  if (!priceId) return null;
  const starterMonthly = process.env.STRIPE_PRICE_STARTER_MONTHLY;
  const starterYearly = process.env.STRIPE_PRICE_STARTER_YEARLY;
  const soloMonthly = process.env.STRIPE_PRICE_SOLO_MONTHLY;
  const soloYearly = process.env.STRIPE_PRICE_SOLO_YEARLY;
  const proMonthly = process.env.STRIPE_PRICE_PRO_MONTHLY;
  const proYearly = process.env.STRIPE_PRICE_PRO_YEARLY;

  if (priceId === starterMonthly || priceId === starterYearly) return "starter";
  if (priceId === soloMonthly || priceId === soloYearly) return "solo";
  if (priceId === proMonthly || priceId === proYearly) return "pro";
  return null;
}
