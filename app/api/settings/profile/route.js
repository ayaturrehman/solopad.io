import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import db from "@/lib/db";

export async function GET() {
  const session = await getSession();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: {
      name: true,
      email: true,
      role: true,
      companyName: true,
      companyLogo: true,
      timezone: true,
      currency: true,
    },
  });

  return NextResponse.json({ user });
}

export async function PATCH(req) {
  const session = await getSession();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name, role, companyName, companyLogo, timezone, currency } = await req.json();

  const user = await db.user.findUnique({ where: { id: session.user.id }, select: { currency: true } });

  await db.user.update({
    where: { id: session.user.id },
    data: {
      ...(name !== undefined && { name: name?.trim() || "" }),
      ...(role !== undefined && { role }),
      ...(companyName !== undefined && { companyName: companyName?.trim() || null }),
      ...(companyLogo !== undefined && { companyLogo: companyLogo?.trim() || null }),
      ...(timezone !== undefined && { timezone: timezone?.trim() || "UTC" }),
      currency: currency ?? user.currency,
    },
  });

  return NextResponse.json({ success: true });
}
