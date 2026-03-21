import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/permissions";
import Stripe from "stripe";
import db from "@/lib/db";

const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;

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
      await stripe.oauth.deauthorize({
        client_id: process.env.STRIPE_CLIENT_ID,
        stripe_user_id: user.stripeAccountId,
      });
    } catch {
      // Account may already be deauthorized — still clear from DB
    }
  }

  await db.user.update({
    where: { id: session.user.id },
    data: { stripeAccountId: null, stripeOnboarded: false },
  });

  return NextResponse.json({ ok: true });
}
