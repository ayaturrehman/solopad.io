import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/permissions";
import { requireStripe } from "@/lib/stripe";
import db from "@/lib/db";

// GET /api/settings/stripe/connect
// Creates an Express Connect account and redirects to Stripe's onboarding
export async function GET() {
  try {
    const { session, error, status: permStatus } = await requirePermission("manage_settings");
    if (error) return NextResponse.json({ error }, { status: permStatus });

    const stripe = requireStripe();
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || "http://localhost:3000";

    // Check if user already has a connected account
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { stripeAccountId: true, stripeOnboarded: true },
    });

    let accountId = user?.stripeAccountId;

    // If there's an existing account, verify it's still valid and is Express type
    if (accountId) {
      try {
        const existing = await stripe.accounts.retrieve(accountId);
        // If it's a Standard account (from old OAuth flow), clear it and create Express
        if (existing.type !== "express") {
          console.log("[Stripe Connect] Clearing old Standard account, creating Express");
          await db.user.update({
            where: { id: session.user.id },
            data: { stripeAccountId: null, stripeOnboarded: false },
          });
          accountId = null;
        }
      } catch (retrieveErr) {
        // Account doesn't exist or was deleted — clear and recreate
        console.log("[Stripe Connect] Old account invalid, creating new one:", retrieveErr.message);
        await db.user.update({
          where: { id: session.user.id },
          data: { stripeAccountId: null, stripeOnboarded: false },
        });
        accountId = null;
      }
    }

    if (!accountId) {
      // Create a new Express account
      const account = await stripe.accounts.create({
        type: "express",
        email: session.user.email || undefined,
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
        business_type: "individual",
        metadata: {
          solopad_user_id: session.user.id,
        },
      });

      accountId = account.id;

      // Save the account ID
      await db.user.update({
        where: { id: session.user.id },
        data: { stripeAccountId: accountId, stripeOnboarded: false },
      });
    }

    // Create an Account Link for onboarding
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${appUrl}/api/settings/stripe/connect`,
      return_url: `${appUrl}/api/settings/stripe/callback?account_id=${accountId}`,
      type: "account_onboarding",
    });

    return NextResponse.redirect(accountLink.url);
  } catch (err) {
    console.error("[Stripe Connect] Error:", err.message, err.type, err.code);
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    return NextResponse.redirect(
      `${appUrl}/settings/payments?stripe=error&msg=${encodeURIComponent(err.message)}`
    );
  }
}
