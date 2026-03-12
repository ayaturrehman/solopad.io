import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getTenantData } from "@/lib/tenant";
import db from "@/lib/db";
import { nanoid } from "nanoid";

export async function POST(req) {
  const session = await getSession();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { title, clientName, clientEmail, description, startDate, endDate, status } = await req.json();

  const tenantData = await getTenantData(session);

  const project = await db.project.create({
    data: {
      ...tenantData,
      title,
      clientName,
      clientEmail: clientEmail || null,
      description: description || null,
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null,
      status: status || "in_progress",
      portalToken: nanoid(12),
    },
  });

  return NextResponse.json(project);
}
