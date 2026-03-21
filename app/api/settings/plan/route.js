import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { requirePermission } from "@/lib/permissions";
import db from "@/lib/db";
import { getPlan, isValidPlan, PLAN_ORDER } from "@/lib/plans";

export async function GET() { try {
    const session = await getSession();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { plan: true },
    });

    return NextResponse.json({
      plan: user?.plan ?? "starter",
      plans: PLAN_ORDER.map((planId) => getPlan(planId)),
    });

  } catch (err) {
    console.error("[Settings Plan GET]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(req) { try {
    const { session, error, status: permStatus } = await requirePermission("manage_settings");
    if (error) return NextResponse.json({ error }, { status: permStatus });

    const body = await req.json();
    const nextPlan = body.plan;

    if (!isValidPlan(nextPlan)) {
      return NextResponse.json({ error: "Invalid plan selected." }, { status: 400 });
    }

    await db.user.update({
      where: { id: session.user.id },
      data: { plan: nextPlan },
    });

    return NextResponse.json({ success: true, plan: nextPlan });

  } catch (err) {
    console.error("[Settings Plan PATCH]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
