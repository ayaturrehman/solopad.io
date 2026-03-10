import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import db from "@/lib/db";
import { normalizeTask, serializeSubtasks } from "@/lib/tasks";

export async function PATCH(req, { params }) {
  const session = await getSession();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const task = await db.task.findUnique({ where: { id } });
  if (!task || task.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await req.json();
  const { status, title, priority, dueDate, completedAt, description, projectId, assigneeMemberId, subtasks } = body;

  if (assigneeMemberId) {
    const member = await db.teamMember.findFirst({
      where: { id: assigneeMemberId, userId: session.user.id },
    });
    if (!member) {
      return NextResponse.json({ error: "Invalid assignee." }, { status: 400 });
    }
  }

  const updated = await db.task.update({
    where: { id },
    data: {
      ...(status !== undefined && { status }),
      ...(title !== undefined && { title }),
      ...(projectId !== undefined && { projectId: projectId || null }),
      ...(assigneeMemberId !== undefined && { assigneeMemberId: assigneeMemberId || null }),
      ...(priority !== undefined && { priority }),
      ...(dueDate !== undefined && { dueDate: dueDate ? new Date(dueDate) : null }),
      ...(completedAt !== undefined && { completedAt: completedAt ? new Date(completedAt) : null }),
      ...(description !== undefined && { description }),
      ...(subtasks !== undefined && { subtasks: serializeSubtasks(subtasks) }),
    },
    include: {
      project: { select: { id: true, title: true } },
      assigneeMember: { select: { id: true, name: true, email: true, role: true } },
    },
  });

  return NextResponse.json({ task: normalizeTask(updated) });
}

export async function DELETE(req, { params }) {
  const session = await getSession();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const task = await db.task.findUnique({ where: { id } });
  if (!task || task.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await db.task.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
