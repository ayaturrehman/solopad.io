import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/permissions";
import { getTenantFilter, getTenantData } from "@/lib/tenant";
import db from "@/lib/db";
import { normalizeCategoryName } from "@/lib/expenses";

export async function GET() { try {
    const { session, error, status: permStatus } = await requirePermission("view_finances");
    if (error) return NextResponse.json({ error }, { status: permStatus });

    const filter = await getTenantFilter(session);

    const categories = await db.expenseCategory.findMany({
      where: filter,
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ categories });

  } catch (err) {
    console.error("[Expense Categories GET]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req) { try {
    const { session, error, status: permStatus } = await requirePermission("manage_invoices");
    if (error) return NextResponse.json({ error }, { status: permStatus });

    const body = await req.json();
    const name = normalizeCategoryName(body.name);

    if (!name) {
      return NextResponse.json({ error: "Category name is required." }, { status: 400 });
    }

    const tenantData = await getTenantData(session);

    const category = await db.expenseCategory.create({
      data: {
        ...tenantData,
        name,
      },
    }).catch(() => null);

    if (!category) {
      return NextResponse.json({ error: "Category already exists." }, { status: 400 });
    }

    return NextResponse.json({ category }, { status: 201 });

  } catch (err) {
    console.error("[Expense Categories POST]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
