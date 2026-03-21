import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/permissions";
import { getTenantFilter } from "@/lib/tenant";
import db from "@/lib/db";
import { RECURRING_FREQUENCIES, normalizeCategoryName } from "@/lib/expenses";

export async function PATCH(req, { params }) { try {
    const { session, error, status: permStatus } = await requirePermission("manage_invoices");
    if (error) return NextResponse.json({ error }, { status: permStatus });

    const { id } = await params;
    const body = await req.json();

    const filter = await getTenantFilter(session);

    const recurringExpense = await db.recurringExpense.findFirst({
      where: { id, ...filter },
    });

    if (!recurringExpense) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const frequency = body.frequency || recurringExpense.frequency;
    if (!RECURRING_FREQUENCIES[frequency]) {
      return NextResponse.json({ error: "Invalid recurring frequency." }, { status: 400 });
    }

    const note = body.note?.trim() || null;
    if (note && note.length > 100) {
      return NextResponse.json({ error: "Note must be 100 characters or fewer." }, { status: 400 });
    }

    let resolvedProjectId = recurringExpense.projectId ?? null;
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

    const updated = await db.recurringExpense.update({
      where: { id },
      data: {
        projectId: resolvedProjectId,
        description: body.description?.trim() || recurringExpense.description,
        note: body.note !== undefined ? note : recurringExpense.note,
        amount: body.amount !== undefined ? parseFloat(body.amount) : recurringExpense.amount,
        category: body.category ? normalizeCategoryName(body.category) : recurringExpense.category,
        frequency,
        nextDate: body.nextDate ? new Date(body.nextDate) : recurringExpense.nextDate,
        active: body.active !== undefined ? Boolean(body.active) : recurringExpense.active,
      },
    });

    return NextResponse.json({ recurringExpense: updated });

  } catch (err) {
    console.error("[Recurring Expenses PATCH]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req, { params }) { try {
    const { session, error, status: permStatus } = await requirePermission("manage_invoices");
    if (error) return NextResponse.json({ error }, { status: permStatus });

    const { id } = await params;

    const filter = await getTenantFilter(session);

    const recurringExpense = await db.recurringExpense.findFirst({
      where: { id, ...filter },
    });

    if (!recurringExpense) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await db.recurringExpense.delete({ where: { id } });

    return NextResponse.json({ success: true });

  } catch (err) {
    console.error("[Recurring Expenses DELETE]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
