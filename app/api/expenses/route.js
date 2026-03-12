import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getTenantFilter, getTenantData } from "@/lib/tenant";
import db from "@/lib/db";

export async function GET(req) {
  const session = await getSession();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const filter = await getTenantFilter(session);

  const expenses = await db.expense.findMany({
    where: filter,
    include: {
      project: { select: { id: true, title: true } },
    },
    orderBy: { date: "desc" },
  });

  return NextResponse.json(expenses);
}

export async function POST(req) {
  const session = await getSession();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { description, amount, category, date, projectId, note } = await req.json();

  if (!description?.trim() || !amount) {
    return NextResponse.json({ error: "Description and amount are required" }, { status: 400 });
  }

  const normalizedNote = note?.trim() || null;
  if (normalizedNote && normalizedNote.length > 100) {
    return NextResponse.json({ error: "Note must be 100 characters or fewer." }, { status: 400 });
  }

  const filter = await getTenantFilter(session);

  let resolvedProjectId = null;
  if (projectId) {
    const project = await db.project.findFirst({
      where: { id: projectId, ...filter },
      select: { id: true },
    });
    if (!project) {
      return NextResponse.json({ error: "Invalid project." }, { status: 400 });
    }
    resolvedProjectId = project.id;
  }

  const tenantData = await getTenantData(session);

  const expense = await db.expense.create({
    data: {
      ...tenantData,
      projectId: resolvedProjectId,
      description: description.trim(),
      note: normalizedNote,
      amount: parseFloat(amount),
      category: category || "other",
      date: date ? new Date(date) : new Date(),
    },
  });

  return NextResponse.json(expense, { status: 201 });
}
