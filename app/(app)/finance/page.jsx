import { Suspense } from "react";
import { getSession } from "@/lib/session";
import db from "@/lib/db";
import { redirect } from "next/navigation";

export const revalidate = 60;
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";
import ExpensesClient from "./ExpensesClient";
import InvoicesClient from "../invoices/InvoicesClient";
import PaymentsClient from "./PaymentsClient";
import FinanceOverviewClient from "./FinanceOverviewClient";
import {
  DEFAULT_EXPENSE_CATEGORIES,
  getExpenseCategoryOptions,
  RECURRING_FREQUENCIES,
  supportsExtendedExpenseModels,
  syncRecurringExpenses,
} from "@/lib/expenses";

const TABS = ["overview", "invoices", "payments", "expenses"];

export default async function FinancePage({ searchParams }) {
  const session = await getSession();
  if (!session?.user) redirect("/login");

  const sp = await searchParams;
  const tab = TABS.includes(sp?.tab) ? sp.tab : "overview";

  const userId = session.user.id;
  const now = new Date();

  const user = await db.user.findUnique({ where: { id: userId }, select: { businessId: true } });
  const business = user?.businessId
    ? await db.business.findUnique({ where: { id: user.businessId }, select: { currency: true } })
    : null;
  const currency = business?.currency || "USD";
  const yearStart = new Date(now.getFullYear(), 0, 1);
  const hasExtendedExpenseModels = supportsExtendedExpenseModels();

  await syncRecurringExpenses(userId);

  const [invoices, expenses, projects, customExpenseCategories, recurringExpenses] = await Promise.all([
    db.invoice.findMany({
      where: { project: { userId }, createdAt: { gte: yearStart } },
      include: { project: { select: { title: true, contact: { select: { name: true } } } } },
      orderBy: { createdAt: "desc" },
      take: 200,
    }),
    db.expense.findMany({
      where: { userId, date: { gte: yearStart } },
      include: {
        project: { select: { id: true, title: true } },
      },
      orderBy: { date: "desc" },
      take: 200,
    }),
    db.project.findMany({
      where: { userId, archived: false },
      select: { id: true, title: true },
      orderBy: { title: "asc" },
      take: 100,
    }),
    hasExtendedExpenseModels
      ? db.expenseCategory.findMany({
        where: { userId },
        orderBy: { name: "asc" },
      })
      : Promise.resolve([]),
    hasExtendedExpenseModels
      ? db.recurringExpense.findMany({
        where: { userId },
        include: {
          project: { select: { id: true, title: true } },
        },
        orderBy: [{ active: "desc" }, { nextDate: "asc" }],
        take: 100,
      })
      : Promise.resolve([]),
  ]);

  const expenseCategoryOptions = getExpenseCategoryOptions(customExpenseCategories);
  const customExpenseCategoriesWithUsage = customExpenseCategories.map((category) => {
    const recurringUsage = recurringExpenses.filter((expense) => expense.category === category.name).length;
    const oneTimeUsage = expenses.filter((expense) => expense.category === category.name).length;
    return {
      ...category,
      usageCount: recurringUsage + oneTimeUsage,
    };
  });

  const paid = invoices.filter((i) => i.status === "paid");
  const totalRevenue = paid.reduce((s, i) => s + i.total, 0);
  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
  const netIncome = totalRevenue - totalExpenses;
  const outstanding = invoices
    .filter((i) => i.status !== "paid" && i.status !== "cancelled")
    .reduce((s, i) => s + i.total, 0);

  // Monthly breakdown
  const monthlyRevenue = Array(12).fill(0);
  const monthlyExpenses = Array(12).fill(0);
  paid.forEach((i) => { monthlyRevenue[new Date(i.createdAt).getMonth()] += i.total; });
  expenses.forEach((e) => { monthlyExpenses[new Date(e.date).getMonth()] += e.amount; });
  const maxBar = Math.max(...monthlyRevenue, ...monthlyExpenses, 1);

  return (
    <div>
      <div className="px-4 py-4 md:px-6">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">Finance</h1>
      </div>

      {/* Tabs */}
      <div className="border-b border-zinc-200 px-4 md:px-6">
        {TABS.map((t) => (
          <Link
            key={t}
            href={t === "overview" ? "/finance" : `/finance?tab=${t}`}
            className={`relative mr-8 inline-flex h-12 items-center text-sm font-medium capitalize transition-colors ${
              tab === t
                ? "text-blue-600"
                : "text-zinc-400 hover:text-zinc-700"
            }`}
          >
            <span>{t === "payments" ? "Payments" : t}</span>
            <span
              className={`absolute inset-x-0 bottom-0 h-0.5 transition-opacity ${
                tab === t ? "bg-blue-600 opacity-100" : "bg-transparent opacity-0"
              }`}
            />
          </Link>
        ))}
      </div>

      {/* Overview tab */}
      {tab === "overview" && (
        <FinanceOverviewClient
          totalRevenue={totalRevenue}
          totalExpenses={totalExpenses}
          netIncome={netIncome}
          outstanding={outstanding}
          monthlyRevenue={monthlyRevenue}
          monthlyExpenses={monthlyExpenses}
          maxBar={maxBar}
          currency={currency}
          invoices={invoices}
          paid={paid}
          expenses={expenses}
        />
      )}

      {tab === "invoices" && (
        <Suspense fallback={null}><InvoicesClient invoices={invoices} projects={projects} currency={currency} /></Suspense>
      )}

      {/* Payments tab */}
      {tab === "payments" && (
        <Suspense fallback={null}>
          <PaymentsClient payments={paid} currency={currency} />
        </Suspense>
      )}

      {/* Expenses tab */}
      {tab === "expenses" && (
        <Suspense fallback={null}><ExpensesClient
          expenses={expenses}
          recurringExpenses={recurringExpenses}
          categories={expenseCategoryOptions}
          projects={projects}
          defaultCategories={DEFAULT_EXPENSE_CATEGORIES}
          customCategories={customExpenseCategoriesWithUsage}
          hasExtendedExpenseModels={hasExtendedExpenseModels}
          recurringFrequencyLabels={RECURRING_FREQUENCIES}
          currency={currency}
          /></Suspense>
      )}
    </div>
  );
}
