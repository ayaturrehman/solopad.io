import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getTenantFilter } from "@/lib/tenant";
import db from "@/lib/db";

async function getOwnedService(id, session) {
  const filter = await getTenantFilter(session);
  return db.service.findFirst({ where: { id, ...filter } });
}

export async function PATCH(req, { params }) {
  const session = await getSession();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();

  const service = await getOwnedService(id, session);
  if (!service) return NextResponse.json({ error: "Not found" }, { status: 404 });

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

  const service = await getOwnedService(id, session);
  if (!service) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await db.service.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
