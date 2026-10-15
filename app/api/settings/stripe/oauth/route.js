import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/permissions";
import { createOAuthState, OAUTH_COOKIE } from "@/lib/stripe-oauth";
import db from "@/lib/db";
export async function GET() {
  const { session, error, status } = await requirePermission("manage_settings");
  if (error) return NextResponse.json({ error }, { status });
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL;
  const clientId =
    process.env.STRIPE_CONNECT_CLIENT_ID || process.env.STRIPE_CLIENT_ID;
  if (!clientId || !appUrl)
    return NextResponse.json(
      {
        error:
          "Existing Stripe connections are not configured yet. Contact SoloPad support.",
      },
      { status: 503 },
    );
  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { stripeAccountId: true },
  });
  if (user?.stripeAccountId)
    return NextResponse.redirect(
      `${appUrl}/settings/payments?stripe=error&msg=Disconnect%20your%20current%20Stripe%20connection%20first.`,
    );
  const state = createOAuthState(session.user.id, process.env.NEXTAUTH_SECRET);
  const url = new URL("https://connect.stripe.com/oauth/authorize");
  url.search = new URLSearchParams({
    response_type: "code",
    client_id: clientId,
    scope: "read_write",
    state,
    redirect_uri: `${appUrl}/api/settings/stripe/oauth/callback`,
  }).toString();
  const response = NextResponse.redirect(url);
  response.cookies.set(OAUTH_COOKIE, state, {
    httpOnly: true,
    secure: appUrl.startsWith("https:"),
    sameSite: "lax",
    maxAge: 600,
    path: "/api/settings/stripe/oauth",
  });
  return response;
}
