import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import db from "@/lib/db";
import { getPlan, PLAN_ORDER, normalizePlan } from "@/lib/plans";

export async function GET() { try {
    const session = await getSession();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Read the authoritative plan from the business subscription, not the JWT.
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { plan: true, business: { select: { plan: true } } },
    });

    return NextResponse.json({
      plan: normalizePlan(user?.business?.plan ?? user?.plan),
      plans: PLAN_ORDER.map((planId) => getPlan(planId)),
    });

  } catch (err) {
    console.error("[Settings Plan GET]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// NOTE: Plan changes are intentionally NOT exposed here. A subscription's plan
// is authoritative in Stripe and is only ever mutated by the verified billing
// webhook (app/api/billing/webhook). Allowing clients to PATCH their own plan
// would let any user grant themselves paid tiers for free and manipulate the
// platform fee applied to client payments.
