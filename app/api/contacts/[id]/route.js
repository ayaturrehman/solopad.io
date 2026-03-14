import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getTenantFilter } from "@/lib/tenant";
import db from "@/lib/db";
import { normalizeContactInput } from "@/lib/contacts";

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

  try {
    const { id } = await params;
    const normalized = normalizeContactInput(await req.json(), { requireName: true });

    if (normalized.errors.length) {
      return NextResponse.json({ error: normalized.errors[0] }, { status: 400 });
    }

    const filter = await getTenantFilter(session);
    const contact = await db.contact.findFirst({ where: { id, ...filter } });
    if (!contact) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const updated = await db.contact.update({
      where: { id },
      data: normalized.data,
    });

    return NextResponse.json(updated);
  } catch (error) {
    const message =
      process.env.NODE_ENV === "production"
        ? "Failed to save contact."
        : error?.message || "Failed to save contact.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
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
