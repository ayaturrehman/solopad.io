import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import db from "@/lib/db";

export async function PATCH(req, { params }) {
  const session = await getSession();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const task = await db.task.findUnique({ where: { id: params.id } });
  if (!task || task.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await req.json();
  const { status, title, priority, dueDate, completedAt, description } = body;

  const updated = await db.task.update({
    where: { id: params.id },
    data: {
      ...(status !== undefined && { status }),
      ...(title !== undefined && { title }),
      ...(priority !== undefined && { priority }),
      ...(dueDate !== undefined && { dueDate: dueDate ? new Date(dueDate) : null }),
      ...(completedAt !== undefined && { completedAt: completedAt ? new Date(completedAt) : null }),
      ...(description !== undefined && { description }),
    },
    include: { project: { select: { id: true, title: true } } },
  });

  return NextResponse.json({ task: updated });
}

export async function DELETE(req, { params }) {
  const session = await getSession();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const task = await db.task.findUnique({ where: { id: params.id } });
  if (!task || task.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await db.task.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
