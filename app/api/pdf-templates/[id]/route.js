import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import db from "@/lib/db";
import { validateTemplateUpdates } from "@/lib/pdf-templates/defaultTemplate";

export async function GET(request, { params }) {
  const { id } = await params;
  const session = await getSession();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const template = await db.pdfTemplate.findFirst({
    where: { id, userId: session.user.id },
  });

  if (!template) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ template });
}

export async function PATCH(request, { params }) {
  const { id } = await params;
  const session = await getSession();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const existing = await db.pdfTemplate.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await request.json();
  // Strip protected fields
  const { id: _id, userId: _userId, createdAt: _createdAt, isDefault: _isDefault, ...updates } = body;

  const errors = validateTemplateUpdates(updates);
  if (errors.length > 0) {
    return NextResponse.json({ error: errors.join("; ") }, { status: 400 });
  }

  const template = await db.pdfTemplate.update({
    where: { id },
    data: updates,
  });

  return NextResponse.json({ template });
}

export async function DELETE(request, { params }) {
  const { id } = await params;
  const session = await getSession();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const existing = await db.pdfTemplate.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await db.pdfTemplate.delete({ where: { id } });

  // If it was default, promote the next one
  if (existing.isDefault) {
    const next = await db.pdfTemplate.findFirst({
      where: { userId: session.user.id, type: existing.type },
      orderBy: { createdAt: "asc" },
    });
    if (next) {
      await db.pdfTemplate.update({ where: { id: next.id }, data: { isDefault: true } });
    }
  }

  return NextResponse.json({ success: true });
}
