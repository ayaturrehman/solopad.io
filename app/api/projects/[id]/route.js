import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getTenantFilter } from "@/lib/tenant";
import db from "@/lib/db";

export async function PATCH(req, { params }) {
  const session = await getSession();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();

  // Coerce date strings to Date objects for Prisma
  const data = { ...body };
  if (data.endDate !== undefined) data.endDate = data.endDate ? new Date(data.endDate) : null;
  if (data.startDate !== undefined) data.startDate = data.startDate ? new Date(data.startDate) : null;

  const filter = await getTenantFilter(session);

  const project = await db.project.updateMany({
    where: { id, ...filter },
    data,
  });

  return NextResponse.json(project);
}

export async function DELETE(req, { params }) {
  const session = await getSession();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const filter = await getTenantFilter(session);

  await db.project.deleteMany({
    where: { id, ...filter },
  });

  return NextResponse.json({ success: true });
}
