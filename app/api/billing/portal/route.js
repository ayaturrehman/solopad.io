import { NextResponse } from "next/server";
import { requireStripe } from "@/lib/stripe";
import { requirePermission } from "@/lib/permissions";
import db from "@/lib/db";

export async function POST(req) {
  try {
    const stripe = requireStripe();
    const { session, error, status: permStatus } = await requirePermission("manage_billing");
    if (error) return NextResponse.json({ error }, { status: permStatus });

    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { businessId: true },
    });

    if (!user?.businessId) {
      return NextResponse.json({ error: "No business account found." }, { status: 400 });
    }

    const subscription = await db.subscription.findUnique({
      where: { businessId: user.businessId },
    });

    if (!subscription?.stripeCustomerId) {
      return NextResponse.json({ error: "No billing account found. Upgrade to a paid plan first." }, { status: 400 });
    }

    // Create Stripe Billing Portal session
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: subscription.stripeCustomerId,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings`,
    });

    return NextResponse.json({ url: portalSession.url });
  } catch (err) {
    console.error("[Billing Portal]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
