import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import db from "@/lib/db";

export async function GET() {
  const session = await getSession();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rules = await db.availabilityRule.findMany({
    where: { userId: session.user.id },
    orderBy: { dayOfWeek: "asc" },
  });

  return NextResponse.json({ rules });
}

export async function PUT(req) {
  const session = await getSession();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { rules } = body;

  if (!Array.isArray(rules)) {
    return NextResponse.json({ error: "rules must be an array" }, { status: 400 });
  }

  // Delete all existing rules and replace
  await db.availabilityRule.deleteMany({ where: { userId: session.user.id } });

  const created = await Promise.all(
    rules.map((r) =>
      db.availabilityRule.create({
        data: {
          userId: session.user.id,
          dayOfWeek: r.dayOfWeek,
          startTime: r.startTime,
          endTime: r.endTime,
        },
      })
    )
  );

  return NextResponse.json({ rules: created });
}
