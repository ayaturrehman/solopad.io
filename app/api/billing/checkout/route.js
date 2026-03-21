import { NextResponse } from "next/server";
import { requireStripe } from "@/lib/stripe";
import { getStripePriceId } from "@/lib/plans";
import { requirePermission } from "@/lib/permissions";
import db from "@/lib/db";

export async function POST(req) {
  try {
    const stripe = requireStripe();
    const { session, error, status: permStatus } = await requirePermission("manage_billing");
    if (error) return NextResponse.json({ error }, { status: permStatus });

    const { plan, interval = "monthly", couponCode } = await req.json();

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

    if (subscription?.stripeCustomerId) {
      stripeCustomerId = subscription.stripeCustomerId;
    } else {
      // Create Stripe customer
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name,
        metadata: { businessId: user.businessId, userId: user.id },
      });
      stripeCustomerId = customer.id;

      // Create subscription record (no active subscription yet — that comes from webhook)
      subscription = await db.subscription.create({
        data: {
          businessId: user.businessId,
          stripeCustomerId: customer.id,
          plan: "starter",
          status: "active",
        },
      });
    }

    // Build checkout session
    const checkoutOptions = {
      mode: "subscription",
      customer: stripeCustomerId,
      line_items: [{ price: priceId, quantity: 1 }],
      metadata: { businessId: user.businessId, plan, interval },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings?billing=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings?billing=cancelled`,
      subscription_data: {
        metadata: { businessId: user.businessId, plan },
      },
      allow_promotion_codes: !couponCode, // Allow manual entry if no code provided
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
