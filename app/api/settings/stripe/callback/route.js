import { NextResponse } from "next/server";
import Stripe from "stripe";
import db from "@/lib/db";

const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;

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
    // stripe.oauth was removed in SDK v10+; use the token endpoint directly
    const tokenRes = await fetch("https://connect.stripe.com/oauth/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        client_secret: process.env.STRIPE_SECRET_KEY,
      }),
    });

    const tokenData = await tokenRes.json();
    if (tokenData.error) throw new Error(tokenData.error_description || tokenData.error);

    const accountId = tokenData.stripe_user_id;

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
