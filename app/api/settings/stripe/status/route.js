import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import db from "@/lib/db";

export async function GET() { try {
    const session = await getSession();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { stripeAccountId: true, stripeOnboarded: true },
    });

    return NextResponse.json({
      connected: !!user?.stripeAccountId,
      onboarded: !!user?.stripeOnboarded,
      accountId: user?.stripeAccountId || null,
    });

  } catch (err) {
    console.error("[Settings Stripe Status GET]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
