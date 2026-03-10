import { NextResponse } from "next/server";
import Stripe from "stripe";
import db from "@/lib/db";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// GET /api/settings/stripe/callback?code=...&state=userId
export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const userId = searchParams.get("state");
  const error = searchParams.get("error");

  const appUrl = process.env.NEXT_PUBLIC_APP_URL;

  if (error || !code || !userId) {
    return NextResponse.redirect(
      `${appUrl}/settings?stripe=error`
    );
  }

  try {
    // Exchange code for access token + connected account ID
    const response = await stripe.oauth.token({
      grant_type: "authorization_code",
      code,
    });

    const accountId = response.stripe_user_id;

    // Verify the account is charges_enabled
    const account = await stripe.accounts.retrieve(accountId);

    await db.user.update({
      where: { id: userId },
      data: {
        stripeAccountId: accountId,
        stripeOnboarded: account.charges_enabled,
      },
    });

    return NextResponse.redirect(`${appUrl}/settings?stripe=connected`);
  } catch (err) {
    console.error("[Stripe OAuth callback]", err);
    return NextResponse.redirect(`${appUrl}/settings?stripe=error`);
  }
}
