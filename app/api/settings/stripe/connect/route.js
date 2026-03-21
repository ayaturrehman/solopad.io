import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";

// GET /api/settings/stripe/connect
// Redirects the user to Stripe's OAuth page to connect their account
export async function GET() { try {
    const session = await getSession();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const clientId = process.env.STRIPE_CLIENT_ID;
    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/settings/stripe/callback`;

    const params = new URLSearchParams({
      response_type: "code",
      client_id: clientId,
      scope: "read_write",
      redirect_uri: redirectUri,
      state: session.user.id, // used to identify the user on callback
      "stripe_user[email]": session.user.email || "",
    });

    return NextResponse.redirect(
      `https://connect.stripe.com/oauth/authorize?${params.toString()}`
    );

  } catch (err) {
    console.error("[Settings Stripe Connect GET]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
