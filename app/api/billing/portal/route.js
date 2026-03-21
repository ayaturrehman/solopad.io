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

    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null) ||
      new URL(req.url).origin;

    // Verify customer still exists in Stripe
    const customer = await stripe.customers.retrieve(subscription.stripeCustomerId).catch((e) => {
      if (e.code === "resource_missing") return null;
      throw e;
    });
    if (!customer || customer.deleted) {
      await db.subscription.update({
        where: { businessId: user.businessId },
        data: { stripeCustomerId: null, stripeSubscriptionId: null, status: "canceled" },
      }).catch(() => {});
      return NextResponse.json({ error: "Billing account not found. Please subscribe to a plan." }, { status: 400 });
    }

    // Create Stripe Billing Portal session
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: subscription.stripeCustomerId,
      return_url: `${baseUrl}/settings`,
    });

    return NextResponse.json({ url: portalSession.url });
  } catch (err) {
    console.error("[Billing Portal]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
