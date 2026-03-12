import { getSession } from "@/lib/session";
import { getTenantFilter } from "@/lib/tenant";
import db from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  const { id } = await params;
  const session = await getSession();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const filter = await getTenantFilter(session);

  const proposal = await db.proposal.findFirst({
    where: { id, ...filter },
    include: { project: { select: { id: true, title: true } } },
  });

  if (!proposal) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ proposal });
}

export async function PATCH(req, { params }) {
  const { id } = await params;
  const session = await getSession();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const filter = await getTenantFilter(session);
  const proposal = await db.proposal.findFirst({ where: { id, ...filter } });
  if (!proposal) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await req.json();
  const {
    title, projectId, clientName, clientEmail, intro,
    sections, pricing, total, currency, validUntil, status,
  } = body;

  const updateData = {};
  if (title !== undefined) updateData.title = title;
  if (projectId !== undefined) updateData.projectId = projectId || null;
  if (clientName !== undefined) updateData.clientName = clientName;
  if (clientEmail !== undefined) updateData.clientEmail = clientEmail || null;
  if (intro !== undefined) updateData.intro = intro || null;
  if (sections !== undefined) updateData.sections = typeof sections === "string" ? sections : JSON.stringify(sections);
  if (pricing !== undefined) updateData.pricing = typeof pricing === "string" ? pricing : JSON.stringify(pricing);
  if (total !== undefined) updateData.total = parseFloat(total) || 0;
  if (currency !== undefined) updateData.currency = currency;
  if (validUntil !== undefined) updateData.validUntil = validUntil ? new Date(validUntil) : null;
  if (status !== undefined) {
    updateData.status = status;
    if (status === "sent" && !proposal.sentAt) updateData.sentAt = new Date();
    if (status === "accepted" && !proposal.acceptedAt) updateData.acceptedAt = new Date();
  }

  const updated = await db.proposal.update({ where: { id }, data: updateData });
  return NextResponse.json({ proposal: updated });
}

export async function DELETE(req, { params }) {
  const { id } = await params;
  const session = await getSession();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const filter = await getTenantFilter(session);
  const proposal = await db.proposal.findFirst({ where: { id, ...filter } });
  if (!proposal) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await db.proposal.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
