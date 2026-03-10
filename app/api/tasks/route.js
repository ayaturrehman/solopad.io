import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import db from "@/lib/db";

export async function GET() {
  const session = await getSession();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const tasks = await db.task.findMany({
    where: { userId: session.user.id },
    include: {
      project: { select: { id: true, title: true } },
      assigneeMember: { select: { id: true, name: true, email: true, role: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ tasks });
}

export async function POST(req) {
  const session = await getSession();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { title, projectId, priority, dueDate, description, assigneeMemberId } = body;

  if (!title?.trim()) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }

  if (assigneeMemberId) {
    const member = await db.teamMember.findFirst({
      where: { id: assigneeMemberId, userId: session.user.id },
    });
    if (!member) {
      return NextResponse.json({ error: "Invalid assignee." }, { status: 400 });
    }
  }

  const task = await db.task.create({
    data: {
      userId: session.user.id,
      title: title.trim(),
      projectId: projectId || null,
      assigneeMemberId: assigneeMemberId || null,
      priority: priority || "medium",
      dueDate: dueDate ? new Date(dueDate) : null,
      description: description || null,
    },
    include: {
      project: { select: { id: true, title: true } },
      assigneeMember: { select: { id: true, name: true, email: true, role: true } },
    },
  });

  return NextResponse.json({ task }, { status: 201 });
}
