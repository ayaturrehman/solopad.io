import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getTenantFilter } from "@/lib/tenant";
import db from "@/lib/db";
import { normalizeCategoryName } from "@/lib/expenses";

async function getCategoryUsage(filter, name) {
  const [expenseCount, recurringCount] = await Promise.all([
    db.expense.count({
      where: { ...filter, category: name },
    }),
    db?.recurringExpense?.count
      ? db.recurringExpense.count({
        where: { ...filter, category: name },
      })
      : Promise.resolve(0),
  ]);

  return expenseCount + recurringCount;
}

export async function PATCH(req, { params }) { try {
    const session = await getSession();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const body = await req.json();
    const nextName = normalizeCategoryName(body.name);

    if (!nextName) {
      return NextResponse.json({ error: "Category name is required." }, { status: 400 });
    }

    const filter = await getTenantFilter(session);

    const category = await db.expenseCategory.findFirst({
      where: { id, ...filter },
    });

    if (!category) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    if (category.name === nextName) {
      return NextResponse.json({ category });
    }

    const existing = await db.expenseCategory.findFirst({
      where: {
        ...filter,
        name: nextName,
        NOT: { id },
      },
    });

    if (existing) {
      return NextResponse.json({ error: "Category already exists." }, { status: 400 });
    }

    const updated = await db.$transaction(async (tx) => {
      const renamedCategory = await tx.expenseCategory.update({
        where: { id },
        data: { name: nextName },
      });

      await tx.expense.updateMany({
        where: { ...filter, category: category.name },
        data: { category: nextName },
      });

      if (tx?.recurringExpense?.updateMany) {
        await tx.recurringExpense.updateMany({
          where: { ...filter, category: category.name },
          data: { category: nextName },
        });
      }

      return renamedCategory;
    });

    return NextResponse.json({ category: updated });

  } catch (err) {
    console.error("[Expense Categories PATCH]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req, { params }) { try {
    const session = await getSession();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;

    const filter = await getTenantFilter(session);

    const category = await db.expenseCategory.findFirst({
      where: { id, ...filter },
    });

    if (!category) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const usageCount = await getCategoryUsage(filter, category.name);
    if (usageCount > 0) {
      return NextResponse.json(
        { error: "This category is already used in expenses and cannot be deleted." },
        { status: 400 }
      );
    }

    await db.expenseCategory.delete({ where: { id } });

    return NextResponse.json({ success: true });

  } catch (err) {
    console.error("[Expense Categories DELETE]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
