import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getTenantFilter } from "@/lib/tenant";
import db from "@/lib/db";

export async function GET(req, { params }) {
  const session = await getSession();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const filter = await getTenantFilter(session);

  const contact = await db.contact.findFirst({
    where: { id, ...filter },
    include: {
      projects: {
        include: { invoices: true },
        orderBy: { updatedAt: "desc" },
      },
    },
  });

  if (!contact) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json(contact);
}

export async function PATCH(req, { params }) {
  const session = await getSession();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();

  const filter = await getTenantFilter(session);
  const contact = await db.contact.findFirst({ where: { id, ...filter } });
  if (!contact) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const updated = await db.contact.update({
    where: { id },
    data: {
      name: body.name?.trim() ?? contact.name,
      email: body.email?.trim() ?? contact.email,
      phone: body.phone?.trim() ?? contact.phone,
      company: body.company?.trim() ?? contact.company,
      status: body.status ?? contact.status,
      source: body.source?.trim() ?? contact.source,
      value: body.value !== undefined ? (body.value ? parseFloat(body.value) : null) : contact.value,
      notes: body.notes?.trim() ?? contact.notes,
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(req, { params }) {
  const session = await getSession();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const filter = await getTenantFilter(session);
  const contact = await db.contact.findFirst({ where: { id, ...filter } });
  if (!contact) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await db.contact.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
