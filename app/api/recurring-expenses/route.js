import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getTenantFilter, getTenantData } from "@/lib/tenant";
import db from "@/lib/db";
import { RECURRING_FREQUENCIES, normalizeCategoryName } from "@/lib/expenses";

export async function GET() { try {
    const session = await getSession();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const filter = await getTenantFilter(session);

    const recurringExpenses = await db.recurringExpense.findMany({
      where: filter,
      orderBy: [{ active: "desc" }, { nextDate: "asc" }],
    });

    return NextResponse.json({ recurringExpenses });

  } catch (err) {
    console.error("[Recurring Expenses GET]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req) { try {
    const session = await getSession();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const description = body.description?.trim();
    const amount = parseFloat(body.amount);
    const category = normalizeCategoryName(body.category) || "other";
    const frequency = body.frequency || "monthly";
    const nextDate = body.nextDate ? new Date(body.nextDate) : null;
    const note = body.note?.trim() || null;

    if (!description || Number.isNaN(amount) || !nextDate) {
      return NextResponse.json({ error: "Description, amount, and next date are required." }, { status: 400 });
    }

    if (note && note.length > 100) {
      return NextResponse.json({ error: "Note must be 100 characters or fewer." }, { status: 400 });
    }

    if (!RECURRING_FREQUENCIES[frequency]) {
      return NextResponse.json({ error: "Invalid recurring frequency." }, { status: 400 });
    }

    const filter = await getTenantFilter(session);

    let resolvedProjectId = null;
    if (body.projectId) {
      const project = await db.project.findFirst({
        where: { id: body.projectId, ...filter },
        select: { id: true },
      });
      if (!project) {
        return NextResponse.json({ error: "Invalid project." }, { status: 400 });
      }
      resolvedProjectId = project.id;
    }

    const tenantData = await getTenantData(session);

    const recurringExpense = await db.recurringExpense.create({
      data: {
        ...tenantData,
        projectId: resolvedProjectId,
        description,
        note,
        amount,
        category,
        frequency,
        nextDate,
      },
    });

    return NextResponse.json({ recurringExpense }, { status: 201 });

  } catch (err) {
    console.error("[Recurring Expenses POST]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
