import { getSession } from "@/lib/session";
import db from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getSession();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const leads = await db.lead.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ leads });
}

export async function POST(req) {
  const session = await getSession();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name, email, company, phone, source, status, value, notes } = await req.json();

  if (!name) return NextResponse.json({ error: "Name is required" }, { status: 400 });

  const lead = await db.lead.create({
    data: {
      userId: session.user.id,
      name,
      email: email || null,
      company: company || null,
      phone: phone || null,
      source: source || null,
      status: status || "new",
      value: value ? parseFloat(value) : null,
      notes: notes || null,
    },
  });

  return NextResponse.json({ lead }, { status: 201 });
}
