import { getSession } from "@/lib/session";
import db from "@/lib/db";
import { NextResponse } from "next/server";

async function getLead(id, userId) {
  return db.lead.findFirst({ where: { id, userId } });
}

export async function PATCH(req, { params }) {
  const session = await getSession();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const lead = await getLead(params.id, session.user.id);
  if (!lead) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const data = await req.json();
  const updated = await db.lead.update({
    where: { id: params.id },
    data: {
      name: data.name ?? lead.name,
      email: data.email ?? lead.email,
      company: data.company ?? lead.company,
      phone: data.phone ?? lead.phone,
      source: data.source ?? lead.source,
      status: data.status ?? lead.status,
      value: data.value !== undefined ? (data.value ? parseFloat(data.value) : null) : lead.value,
      notes: data.notes ?? lead.notes,
    },
  });

  return NextResponse.json({ lead: updated });
}

export async function DELETE(req, { params }) {
  const session = await getSession();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const lead = await getLead(params.id, session.user.id);
  if (!lead) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await db.lead.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
