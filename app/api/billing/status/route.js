import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/permissions";
import { requireStripe } from "@/lib/stripe";
import db from "@/lib/db";

export async function GET() {
  try {
    const { session, error, status: permStatus } = await requirePermission("manage_billing");
    if (error) return NextResponse.json({ error }, { status: permStatus });

    // Single query with relation join instead of 2 sequential queries
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: {
        businessId: true,
        business: {
          select: {
            subscription: true,
          },
        },
      },
    });

    if (!user?.businessId) {
      return NextResponse.json({
        plan: "starter",
        status: "active",
        subscription: null,
      });
    }

    let subscription = user.business?.subscription;

    // Self-heal stale billing state when webhook updates are delayed/missed.
    subscription = await reconcileSubscriptionFromStripe(subscription);

    if (!subscription) {
      return NextResponse.json({
        plan: "starter",
        status: "active",
        subscription: null,
      });
    }

    // Determine billing interval from the Stripe price ID
    let interval = "monthly";
    const priceId = subscription.stripePriceId;
    if (priceId) {
      const yearlyPrices = [
        process.env.STRIPE_PRICE_STARTER_YEARLY,
        process.env.STRIPE_PRICE_SOLO_YEARLY,
        process.env.STRIPE_PRICE_PRO_YEARLY,
      ].filter(Boolean);
      if (yearlyPrices.includes(priceId)) {
        interval = "yearly";
      }
    }

    return NextResponse.json({
      plan: subscription.plan,
      status: subscription.status,
      interval,
      subscription: {
        currentPeriodEnd: subscription.currentPeriodEnd,
        cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
        trialEnd: subscription.trialEnd,
      },
    });
  } catch (err) {
    console.error("[Billing Status]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

async function reconcileSubscriptionFromStripe(subscription) {
  if (!subscription) return subscription;

  const hasPendingCustomer = !subscription.stripeCustomerId || subscription.stripeCustomerId.startsWith("pending_");
  if (hasPendingCustomer) return subscription;

  const now = new Date();
  const isTrialValid = subscription.status === "trialing" && subscription.trialEnd && new Date(subscription.trialEnd) > now;
  const isLocallyUsable = subscription.status === "active" || isTrialValid;

  // No need to hit Stripe if local state is already valid.
  if (isLocallyUsable) return subscription;

  let stripe;
  try {
    stripe = requireStripe();
  } catch {
    return subscription;
  }

  let stripeSub = null;

  if (subscription.stripeSubscriptionId) {
    try {
      stripeSub = await stripe.subscriptions.retrieve(subscription.stripeSubscriptionId);
    } catch {
      stripeSub = null;
    }
  }

  if (!stripeSub) {
    try {
      const list = await stripe.subscriptions.list({
        customer: subscription.stripeCustomerId,
        status: "all",
        limit: 10,
      });
      stripeSub = pickBestSubscription(list.data || []);
    } catch {
      stripeSub = null;
    }
  }

  if (!stripeSub) return subscription;

  const plan =
    stripeSub.metadata?.plan ||
    mapPriceIdToPlan(stripeSub.items?.data?.[0]?.price?.id) ||
    subscription.plan;

  const updated = await db.subscription.update({
    where: { id: subscription.id },
    data: {
      stripeSubscriptionId: stripeSub.id,
      stripePriceId: stripeSub.items?.data?.[0]?.price?.id || null,
      plan,
      status: stripeSub.status,
      currentPeriodStart: stripeSub.current_period_start ? new Date(stripeSub.current_period_start * 1000) : null,
      currentPeriodEnd: stripeSub.current_period_end ? new Date(stripeSub.current_period_end * 1000) : null,
      cancelAtPeriodEnd: stripeSub.cancel_at_period_end || false,
      trialEnd: stripeSub.trial_end ? new Date(stripeSub.trial_end * 1000) : null,
    },
  });

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

  return updated;
}

function pickBestSubscription(subscriptions) {
  if (!Array.isArray(subscriptions) || subscriptions.length === 0) return null;

  const rank = {
    active: 5,
    trialing: 4,
    past_due: 3,
    incomplete: 2,
    unpaid: 1,
    canceled: 0,
    incomplete_expired: 0,
  };

  return subscriptions
    .slice()
    .sort((a, b) => {
      const rankDiff = (rank[b.status] ?? -1) - (rank[a.status] ?? -1);
      if (rankDiff !== 0) return rankDiff;

      const aPeriodEnd = a.current_period_end || 0;
      const bPeriodEnd = b.current_period_end || 0;
      if (bPeriodEnd !== aPeriodEnd) return bPeriodEnd - aPeriodEnd;

      return (b.created || 0) - (a.created || 0);
    })[0];
}

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
