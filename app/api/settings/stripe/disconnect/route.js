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
      // For Express accounts, delete the account (removes it from the platform)
      await stripe.accounts.del(user.stripeAccountId);
    } catch (err) {
      // Account may already be deleted or deauthorized — still clear from DB
      console.warn("[Stripe Disconnect] Could not delete account:", err.message);
    }
  }

  await db.user.update({
    where: { id: session.user.id },
    data: { stripeAccountId: null, stripeOnboarded: false },
  });

  return NextResponse.json({ ok: true });
}
