import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import db from "@/lib/db";
import { getPlan, isValidPlan, PLAN_ORDER } from "@/lib/plans";

export async function GET() {
  const session = await getSession();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { plan: true },
  });

  return NextResponse.json({
    plan: user?.plan ?? "free",
    plans: PLAN_ORDER.map((planId) => getPlan(planId)),
  });
}

export async function PATCH(req) {
  const session = await getSession();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

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
}
