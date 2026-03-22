import { NextResponse } from "next/server";
import { requireStripe } from "@/lib/stripe";
import db from "@/lib/db";
import { getSession } from "@/lib/session";

// GET /api/settings/stripe/callback?account_id=acct_xxx
// Called when the user returns from Stripe Express onboarding
export async function GET(req) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.redirect(`${appUrl}/login`);
    }

    const url = new URL(req.url);
    const accountId = url.searchParams.get("account_id");

    if (!accountId) {
      return NextResponse.redirect(`${appUrl}/settings/payments?stripe=error`);
    }

    // Verify this account belongs to the logged-in user
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { stripeAccountId: true },
    });

    if (user?.stripeAccountId !== accountId) {
      console.error("[Stripe Callback] Account mismatch:", accountId, "vs", user?.stripeAccountId);
      return NextResponse.redirect(`${appUrl}/settings/payments?stripe=error`);
    }

    // Check the account status
    const stripe = requireStripe();
    const account = await stripe.accounts.retrieve(accountId);

    const isOnboarded = account.charges_enabled && account.payouts_enabled;

    await db.user.update({
      where: { id: session.user.id },
      data: { stripeOnboarded: isOnboarded },
    });

    if (isOnboarded) {
      return NextResponse.redirect(`${appUrl}/settings/payments?stripe=connected`);
    } else {
      // Onboarding incomplete — user needs to finish
      return NextResponse.redirect(`${appUrl}/settings/payments?stripe=incomplete`);
    }
  } catch (err) {
    console.error("[Stripe Callback]", err);
    return NextResponse.redirect(`${appUrl}/settings/payments?stripe=error`);
  }
}
