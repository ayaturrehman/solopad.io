import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getTenantFilter, getTenantData } from "@/lib/tenant";
import db from "@/lib/db";

export async function GET() {
  const session = await getSession();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const filter = await getTenantFilter(session);

  const services = await db.service.findMany({
    where: filter,
    orderBy: { name: "asc" },
  });

  return NextResponse.json(services);
}

export async function POST(req) {
  const session = await getSession();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name, description, defaultRate, unit } = await req.json();

  if (!name?.trim()) {
    return NextResponse.json({ error: "Service name is required" }, { status: 400 });
  }

  const tenantData = await getTenantData(session);

  const service = await db.service.create({
    data: {
      ...tenantData,
      name: name.trim(),
      description: description?.trim() || null,
      defaultRate: parseFloat(defaultRate) || 0,
      unit: unit || "flat",
    },
  });

  return NextResponse.json(service, { status: 201 });
}
