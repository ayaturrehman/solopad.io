import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getTenantFilter, getTenantData } from "@/lib/tenant";
import db from "@/lib/db";
import { normalizeContactInput } from "@/lib/contacts";

export async function GET(req) {
  const session = await getSession();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || "";
  const status = searchParams.get("status") || "";

  const filter = await getTenantFilter(session);

  const where = {
    ...filter,
    ...(search && {
      OR: [
        { name: { contains: search } },
        { email: { contains: search } },
        { company: { contains: search } },
      ],
    }),
    ...(status && { status }),
  };

  const contacts = await db.contact.findMany({
    where,
    orderBy: { updatedAt: "desc" },
    include: { _count: { select: { projects: true } } },
  });

  return NextResponse.json(contacts);
}

export async function POST(req) {
  const session = await getSession();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const normalized = normalizeContactInput(await req.json(), { requireName: true });
  if (normalized.errors.length) {
    return NextResponse.json({ error: normalized.errors[0] }, { status: 400 });
  }

  const tenantData = await getTenantData(session);

  const contact = await db.contact.create({
    data: {
      ...tenantData,
      ...normalized.data,
    },
  });

  return NextResponse.json(contact, { status: 201 });
}
