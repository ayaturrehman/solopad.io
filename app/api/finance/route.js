import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getTenantFilter } from "@/lib/tenant";
import db from "@/lib/db";

export async function GET(req) { try {
    const session = await getSession();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const year = parseInt(searchParams.get("year") || new Date().getFullYear());
    const month = searchParams.get("month");

    const startDate = month
      ? new Date(year, parseInt(month) - 1, 1)
      : new Date(year, 0, 1);
    const endDate = month
      ? new Date(year, parseInt(month), 0, 23, 59, 59)
      : new Date(year, 11, 31, 23, 59, 59);

    const filter = await getTenantFilter(session);

    const [expenses, paidInvoices, unpaidInvoices] = await Promise.all([
      db.expense.findMany({
        where: { ...filter, date: { gte: startDate, lte: endDate } },
        orderBy: { date: "desc" },
      }),
      db.invoice.findMany({
        where: {
          project: filter,
          status: "paid",
          paidAt: { gte: startDate, lte: endDate },
        },
        include: { project: { select: { title: true, contact: { select: { name: true } } } } },
      }),
      db.invoice.findMany({
        where: {
          project: filter,
          status: { not: "paid" },
        },
        include: { project: { select: { title: true, contact: { select: { name: true } } } } },
      }),
    ]);

    const totalRevenue = paidInvoices.reduce((s, inv) => s + inv.total, 0);
    const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
    const totalOutstanding = unpaidInvoices
      .filter((i) => i.status !== "cancelled" && i.status !== "draft")
      .reduce((s, inv) => s + inv.total, 0);

    return NextResponse.json({
      revenue: totalRevenue,
      expenses: totalExpenses,
      netIncome: totalRevenue - totalExpenses,
      outstanding: totalOutstanding,
      paidInvoices,
      unpaidInvoices,
      expensesList: expenses,
    });

  } catch (err) {
    console.error("[Finance GET]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
