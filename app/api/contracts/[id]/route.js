import { getSession } from "@/lib/session";
import db from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  const { id } = await params;
  const session = await getSession();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const contract = await db.contract.findFirst({
    where: { id, userId: session.user.id },
    include: { project: { select: { id: true, title: true } } },
  });

  if (!contract) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ contract });
}

export async function PATCH(req, { params }) {
  const { id } = await params;
  const session = await getSession();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const contract = await db.contract.findUnique({ where: { id } });
  if (!contract || contract.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await req.json();
  const { title, projectId, clientName, clientEmail, clauses, status, signatureName } = body;

  const updateData = {};
  if (projectId !== undefined) {
    if (projectId) {
      const project = await db.project.findFirst({
        where: { id: projectId, userId: session.user.id },
        select: { id: true },
      });
      if (!project) {
        return NextResponse.json({ error: "Invalid project." }, { status: 400 });
      }
      updateData.projectId = project.id;
    } else {
      updateData.projectId = null;
    }
  }
  if (title !== undefined) updateData.title = title;
  if (clientName !== undefined) updateData.clientName = clientName;
  if (clientEmail !== undefined) updateData.clientEmail = clientEmail || null;
  if (clauses !== undefined) updateData.clauses = typeof clauses === "string" ? clauses : JSON.stringify(clauses);
  if (signatureName !== undefined) updateData.signatureName = signatureName || null;
  if (status !== undefined) {
    updateData.status = status;
    if (status === "sent" && !contract.sentAt) updateData.sentAt = new Date();
    if (status === "signed" && !contract.signedAt) updateData.signedAt = new Date();
  }

  const updated = await db.contract.update({ where: { id }, data: updateData });
  return NextResponse.json({ contract: updated });
}

export async function DELETE(req, { params }) {
  const { id } = await params;
  const session = await getSession();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const contract = await db.contract.findUnique({ where: { id } });
  if (!contract || contract.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await db.contract.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
