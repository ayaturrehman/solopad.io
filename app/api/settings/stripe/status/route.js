import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/permissions";
import db from "@/lib/db";

export async function GET() { try {
    const { session, error, status: permStatus } = await requirePermission("manage_settings");
    if (error) return NextResponse.json({ error }, { status: permStatus });

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
