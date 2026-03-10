import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import db from "@/lib/db";

export async function GET(req) {
  const session = await getSession();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || "";
  const status = searchParams.get("status") || "";

  const where = {
    userId: session.user.id,
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

  const { name, email, phone, company, status, notes } = await req.json();

  if (!name?.trim()) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  // Sanitize inputs
  const contact = await db.contact.create({
    data: {
      userId: session.user.id,
      name: name.trim(),
      email: email?.trim() || null,
      phone: phone?.trim() || null,
      company: company?.trim() || null,
      status: status || "lead",
      notes: notes?.trim() || null,
    },
  });

  return NextResponse.json(contact, { status: 201 });
}
