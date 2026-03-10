import { getSession } from "@/lib/session";
import db from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  const session = await getSession();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const template = await db.template.findUnique({ where: { id } });
  if (!template) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (template.userId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json({ template });
}

export async function PATCH(req, { params }) {
  const session = await getSession();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const template = await db.template.findUnique({ where: { id } });
  if (!template) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (template.userId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const { type, name, description, content } = body;

  if (!type || !name || !content) {
    return NextResponse.json({ error: "type, name, and content are required" }, { status: 400 });
  }

  const updatedTemplate = await db.template.update({
    where: { id },
    data: {
      type,
      name,
      description: description || null,
      content: typeof content === "string" ? content : JSON.stringify(content),
    },
  });

  return NextResponse.json({ template: updatedTemplate });
}

export async function DELETE(req, { params }) {
  const session = await getSession();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const template = await db.template.findUnique({ where: { id } });
  if (!template) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (template.userId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await db.template.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
