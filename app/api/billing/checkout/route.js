import { NextResponse } from "next/server";
import { requireStripe } from "@/lib/stripe";
import { getStripePriceId } from "@/lib/plans";
import { requirePermission } from "@/lib/permissions";
import db from "@/lib/db";

export async function POST(req) {
  try {
    const stripe = requireStripe();
    const { session, error, status: permStatus } = await requirePermission("manage_billing", { skipSubscriptionCheck: true });
    if (error) return NextResponse.json({ error }, { status: permStatus });

    const { plan, interval = "monthly", couponCode } = await req.json();
    const successPath = "/settings/billing?billing=success";
    const cancelPath = "/settings/billing?billing=cancelled";

    // Derive base URL from env or request origin
    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null) ||
      new URL(req.url).origin;

    // Validate plan + get Stripe price ID
    const priceId = getStripePriceId(plan, interval);
    if (!priceId) {
      return NextResponse.json({ error: "Invalid plan or billing not configured for this plan." }, { status: 400 });
    }

    // Get or create subscription record with Stripe customer
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, email: true, name: true, businessId: true },
    });
    if (!user?.businessId) {
      return NextResponse.json({ error: "No business account found." }, { status: 400 });
    }

    let subscription = await db.subscription.findUnique({
      where: { businessId: user.businessId },
    });

    let stripeCustomerId;

    if (subscription?.stripeCustomerId && !subscription.stripeCustomerId.startsWith("pending_")) {
      stripeCustomerId = subscription.stripeCustomerId;
    } else {
      // Create Stripe customer
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name,
        metadata: { businessId: user.businessId, userId: user.id },
      });
      stripeCustomerId = customer.id;

      if (subscription) {
        // Update existing subscription record (created at signup with placeholder)
        await db.subscription.update({
          where: { id: subscription.id },
          data: { stripeCustomerId: customer.id },
        });
      } else {
        // Create subscription record
        subscription = await db.subscription.create({
          data: {
            businessId: user.businessId,
            stripeCustomerId: customer.id,
            plan: "starter",
            status: "active",
          },
        });
      }
    }

    // ─── If user already has an active Stripe subscription, UPDATE it ───
    // This preserves the existing trial period instead of creating a new one
    if (subscription?.stripeSubscriptionId) {
      try {
        const existingSub = await stripe.subscriptions.retrieve(subscription.stripeSubscriptionId);

        // Only update if subscription is active or trialing (not canceled/past_due)
        if (existingSub && (existingSub.status === "active" || existingSub.status === "trialing")) {
          await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
            items: [{
              id: existingSub.items.data[0].id,
              price: priceId,
            }],
            metadata: { businessId: user.businessId, plan },
            proration_behavior: "create_prorations",
            // Trial stays untouched — Stripe keeps the existing trial_end
          });

          // Update local DB immediately (webhook will also fire but this is faster for UI)
          await db.subscription.update({
            where: { id: subscription.id },
            data: { plan, stripePriceId: priceId },
          });
          await db.business.update({
            where: { id: user.businessId },
            data: { plan },
          });

          return NextResponse.json({
            updated: true,
            url: `${baseUrl}${successPath}`,
          });
        }
      } catch (err) {
        // If subscription retrieval fails (e.g. deleted in Stripe), fall through to checkout
        console.log("[Billing Checkout] Existing sub not found, creating new checkout:", err.message);
      }
    }

    // ─── No existing subscription — create new checkout session ───
    const checkoutOptions = {
      mode: "subscription",
      customer: stripeCustomerId,
      line_items: [{ price: priceId, quantity: 1 }],
      metadata: { businessId: user.businessId, plan, interval },
      success_url: `${baseUrl}${successPath}`,
      cancel_url: `${baseUrl}${cancelPath}`,
      subscription_data: {
        metadata: { businessId: user.businessId, plan },
        trial_period_days: 30,
      },
      allow_promotion_codes: !couponCode, // Allow manual entry if no code provided
      adaptive_pricing: { enabled: true }, // Auto-convert to user's local currency
    };

    // Apply specific coupon code if provided
    if (couponCode) {
      // Validate the promo code first
      const promoCodes = await stripe.promotionCodes.list({
        code: couponCode,
        active: true,
        limit: 1,
      });

      if (promoCodes.data.length > 0) {
        checkoutOptions.discounts = [{ promotion_code: promoCodes.data[0].id }];
      } else {
        return NextResponse.json({ error: "Invalid or expired coupon code." }, { status: 400 });
      }
    }

    const checkoutSession = await stripe.checkout.sessions.create(checkoutOptions);

    return NextResponse.json({ url: checkoutSession.url });
  } catch (err) {
    console.error("[Billing Checkout]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
