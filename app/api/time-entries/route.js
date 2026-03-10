import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import db from "@/lib/db";

export async function GET() {
  const session = await getSession();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const entries = await db.timeEntry.findMany({
    where: { userId: session.user.id },
    include: { project: { select: { id: true, title: true } } },
    orderBy: { startedAt: "desc" },
    take: 100,
  });

  return NextResponse.json({ entries });
}

export async function POST(req) {
  const session = await getSession();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { description, projectId, startedAt, endedAt, billable, hourlyRate } = body;

  if (!startedAt) {
    return NextResponse.json({ error: "startedAt is required" }, { status: 400 });
  }

  let duration = 0;
  if (endedAt) {
    duration = Math.round((new Date(endedAt) - new Date(startedAt)) / 1000);
    if (duration < 0) duration = 0;
  }

  const entry = await db.timeEntry.create({
    data: {
      userId: session.user.id,
      description: description || null,
      projectId: projectId || null,
      startedAt: new Date(startedAt),
      endedAt: endedAt ? new Date(endedAt) : null,
      duration,
      billable: billable !== undefined ? billable : true,
      hourlyRate: parseFloat(hourlyRate) || 0,
    },
    include: { project: { select: { id: true, title: true } } },
  });

  return NextResponse.json({ entry }, { status: 201 });
}
