import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
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

  const project = await db.project.updateMany({
    where: { id, userId: session.user.id },
    data,
  });

  return NextResponse.json(project);
}

export async function DELETE(req, { params }) {
  const session = await getSession();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  await db.project.deleteMany({
    where: { id, userId: session.user.id },
  });

  return NextResponse.json({ success: true });
}
