import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/permissions";
import { requireStripe } from "@/lib/stripe";
import db from "@/lib/db";

// POST /api/settings/stripe/disconnect
export async function POST() {
  const { session, error, status: permStatus } = await requirePermission("manage_settings");
  if (error) return NextResponse.json({ error }, { status: permStatus });

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { stripeAccountId: true },
  });

  if (user?.stripeAccountId) {
    try {
      const stripe = requireStripe();
      const account = await stripe.accounts.retrieve(user.stripeAccountId);
      // Standard OAuth access can be revoked without deleting the business's
      // Stripe account. Express accounts remain intact for balances/disputes.
      if (account.type === "standard") {
        if (!process.env.STRIPE_CONNECT_CLIENT_ID) return NextResponse.json({ error: "Stripe connection configuration is missing." }, { status: 503 });
        await stripe.oauth.deauthorize({ client_id: process.env.STRIPE_CONNECT_CLIENT_ID, stripe_user_id: account.id });
      }
    } catch (err) {
      // Preserve the connection on transient errors so the user can retry.
      if (err.code !== "resource_missing") {
        console.warn("[Stripe Disconnect]", err.type);
        return NextResponse.json({ error: "Could not disconnect Stripe. Please try again." }, { status: 502 });
      }
    }
  }

  await db.user.update({
    where: { id: session.user.id },
    data: { stripeAccountId: null, stripeOnboarded: false },
  });

  return NextResponse.json({ ok: true });
}
