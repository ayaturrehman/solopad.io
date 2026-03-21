import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/session";
import { getTenantFilter, getTenantData } from "@/lib/tenant";
import db from "@/lib/db";
import { normalizeTask, serializeSubtasks } from "@/lib/tasks";

export async function GET() { try {
    const session = await getSession();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const filter = await getTenantFilter(session);

    const tasks = await db.task.findMany({
      where: filter,
      include: {
        project: { select: { id: true, title: true } },
        assigneeMember: { select: { id: true, name: true, email: true, role: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ tasks: tasks.map(normalizeTask) });

  } catch (err) {
    console.error("[Tasks GET]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req) { try {
    const session = await getSession();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { title, projectId, priority, dueDate, description, assigneeMemberId, subtasks, status } = body;

    if (!title?.trim()) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    if (assigneeMemberId) {
      const tenantFilterForAssignee = await getTenantFilter(session);
      const member = await db.teamMember.findFirst({
        where: { id: assigneeMemberId, ...tenantFilterForAssignee },
      });
      if (!member) {
        return NextResponse.json({ error: "Invalid assignee." }, { status: 400 });
      }
    }

    const tenantData = await getTenantData(session);

    const task = await db.task.create({
      data: {
        ...tenantData,
        title: title.trim(),
        projectId: projectId || null,
        assigneeMemberId: assigneeMemberId || null,
        status: status || "todo",
        priority: priority || "medium",
        dueDate: dueDate ? new Date(dueDate) : null,
        description: description || null,
        subtasks: serializeSubtasks(subtasks),
      },
      include: {
        project: { select: { id: true, title: true } },
        assigneeMember: { select: { id: true, name: true, email: true, role: true } },
      },
    });

    revalidatePath("/tasks");
    revalidatePath("/dashboard");
    revalidatePath("/calendar");

    return NextResponse.json({ task: normalizeTask(task) }, { status: 201 });

  } catch (err) {
    console.error("[Tasks POST]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
