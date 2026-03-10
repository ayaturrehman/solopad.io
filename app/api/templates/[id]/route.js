import { getSession } from "@/lib/session";
import db from "@/lib/db";
import { NextResponse } from "next/server";

export async function DELETE(req, { params }) {
  const session = await getSession();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const template = await db.template.findUnique({ where: { id: params.id } });
  if (!template) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (template.userId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await db.template.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
