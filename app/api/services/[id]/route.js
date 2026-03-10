import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import db from "@/lib/db";

export async function PATCH(req, { params }) {
  const session = await getSession();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();

  const service = await db.service.findFirst({ where: { id } });
  if (!service || service.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const updated = await db.service.update({
    where: { id },
    data: {
      name: body.name?.trim() ?? service.name,
      description: body.description?.trim() ?? service.description,
      defaultRate: body.defaultRate !== undefined ? parseFloat(body.defaultRate) : service.defaultRate,
      unit: body.unit ?? service.unit,
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(req, { params }) {
  const session = await getSession();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const service = await db.service.findFirst({ where: { id } });
  if (!service || service.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await db.service.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
