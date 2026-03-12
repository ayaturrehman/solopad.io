import { getSession } from "@/lib/session";
import { getTenantFilter, getTenantData } from "@/lib/tenant";
import db from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getSession();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const filter = await getTenantFilter(session);

  const proposals = await db.proposal.findMany({
    where: filter,
    include: { project: { select: { id: true, title: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ proposals });
}

export async function POST(req) {
  const session = await getSession();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const {
    title, projectId, clientName, clientEmail, intro,
    sections, pricing, total, currency, validUntil, status,
  } = body;

  if (!title || !clientName) {
    return NextResponse.json({ error: "Title and client name are required" }, { status: 400 });
  }

  const tenantData = await getTenantData(session);

  const proposal = await db.proposal.create({
    data: {
      ...tenantData,
      projectId: projectId || null,
      title,
      clientName,
      clientEmail: clientEmail || null,
      intro: intro || null,
      sections: typeof sections === "string" ? sections : JSON.stringify(sections || []),
      pricing: typeof pricing === "string" ? pricing : JSON.stringify(pricing || []),
      total: parseFloat(total) || 0,
      currency: currency || "USD",
      validUntil: validUntil ? new Date(validUntil) : null,
      status: status || "draft",
      sentAt: status === "sent" ? new Date() : null,
    },
  });

  return NextResponse.json({ proposal }, { status: 201 });
}
