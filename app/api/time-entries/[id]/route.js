import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getTenantFilter } from "@/lib/tenant";
import db from "@/lib/db";

export async function PATCH(req, { params }) {
  const session = await getSession();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const filter = await getTenantFilter(session);
  const entry = await db.timeEntry.findFirst({ where: { id: params.id, ...filter } });
  if (!entry) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await req.json();
  const { endedAt, duration, description, billable, hourlyRate } = body;

  const updated = await db.timeEntry.update({
    where: { id: params.id },
    data: {
      ...(endedAt !== undefined && { endedAt: endedAt ? new Date(endedAt) : null }),
      ...(duration !== undefined && { duration }),
      ...(description !== undefined && { description }),
      ...(billable !== undefined && { billable }),
      ...(hourlyRate !== undefined && { hourlyRate: parseFloat(hourlyRate) || 0 }),
    },
    include: { project: { select: { id: true, title: true } } },
  });

  return NextResponse.json({ entry: updated });
}

export async function DELETE(req, { params }) {
  const session = await getSession();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const filter = await getTenantFilter(session);
  const entry = await db.timeEntry.findFirst({ where: { id: params.id, ...filter } });
  if (!entry) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await db.timeEntry.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
