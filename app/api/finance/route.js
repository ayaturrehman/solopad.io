import { summarizeInvoiceMoney } from "@/lib/invoice-money";
import { NON_OUTSTANDING_STATUSES } from "@/lib/invoice-status";
import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/permissions";
import { getTenantFilter } from "@/lib/tenant";
import db from "@/lib/db";

export async function GET(req) { try {
    const { session, error, status: permStatus } = await requirePermission("view_finances");
    if (error) return NextResponse.json({ error }, { status: permStatus });

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
        include: { paymentPlans: true, project: { select: { title: true, contact: { select: { name: true } } } } },
      }),
      db.invoice.findMany({
        where: {
          project: filter,
          status: { notIn: NON_OUTSTANDING_STATUSES },
        },
        include: { paymentPlans: true, project: { select: { title: true, contact: { select: { name: true } } } } },
      }),
    ]);

    const user = await db.user.findUnique({ where: { id: session.user.id }, select: { currency: true, business: { select: { currency: true } } } });
    const currency = user?.business?.currency || user?.currency || "USD";
    const totalsByCurrency = summarizeInvoiceMoney(paidInvoices, expenses, currency);
    totalsByCurrency.outstanding = summarizeInvoiceMoney(unpaidInvoices, [], currency).outstanding;
    const baseTotal = key => totalsByCurrency[key].find(item => item.currency === currency.toUpperCase())?.total || 0;
    const totalRevenue = baseTotal("revenue");
    const totalExpenses = baseTotal("expenses");
    const totalOutstanding = baseTotal("outstanding");

    return NextResponse.json({
      currency,
      totalsByCurrency,
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
