import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/session";
import { getTenantFilter } from "@/lib/tenant";
import db from "@/lib/db";

export async function DELETE(req, { params }) {
  const session = await getSession();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const filter = await getTenantFilter(session);
  const expense = await db.expense.findFirst({ where: { id, ...filter } });
  if (!expense) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await db.expense.delete({ where: { id } });

  revalidatePath("/finance");

  return NextResponse.json({ success: true });
}

export async function PATCH(req, { params }) {
  const session = await getSession();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();

  const filter = await getTenantFilter(session);
  const expense = await db.expense.findFirst({ where: { id, ...filter } });
  if (!expense) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const normalizedNote = body.note?.trim() || null;
  if (normalizedNote && normalizedNote.length > 100) {
    return NextResponse.json({ error: "Note must be 100 characters or fewer." }, { status: 400 });
  }

  let resolvedProjectId = expense.projectId ?? null;
  if (body.projectId !== undefined) {
    if (!body.projectId) {
      resolvedProjectId = null;
    } else {
      const project = await db.project.findFirst({
        where: { id: body.projectId, ...filter },
        select: { id: true },
      });
      if (!project) {
        return NextResponse.json({ error: "Invalid project." }, { status: 400 });
      }
      resolvedProjectId = project.id;
    }
  }

  const updated = await db.expense.update({
    where: { id },
    data: {
      projectId: resolvedProjectId,
      description: body.description?.trim() ?? expense.description,
      note: body.note !== undefined ? normalizedNote : expense.note,
      amount: body.amount !== undefined ? parseFloat(body.amount) : expense.amount,
      category: body.category ?? expense.category,
      date: body.date ? new Date(body.date) : expense.date,
    },
  });

  revalidatePath("/finance");

  return NextResponse.json(updated);
}
