
import { Suspense } from "react";
import { getSession } from "@/lib/session";
import db from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import { cn, formatCurrency } from "@/lib/utils";
import ExpensesClient from "./ExpensesClient";
import InvoicesClient from "../invoices/InvoicesClient";
import PaymentsClient from "./PaymentsClient";
import MonthlyCashflowChart from "./MonthlyCashflowChart";
import {
  DEFAULT_EXPENSE_CATEGORIES,
  getExpenseCategoryOptions,
  RECURRING_FREQUENCIES,
  supportsExtendedExpenseModels,
  syncRecurringExpenses,
} from "@/lib/expenses";

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

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
    }),
    db.expense.findMany({
      where: { userId, date: { gte: yearStart } },
      include: {
        project: { select: { id: true, title: true } },
      },
      orderBy: { date: "desc" },
    }),
    db.project.findMany({
      where: { userId, archived: false },
      select: { id: true, title: true },
      orderBy: { title: "asc" },
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
    <div className="px-4 py-4 md:px-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">Finance</h1>
      </div>

      {/* Tabs */}
      <div className="border-b border-zinc-200 mt-4">
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
        <div className="flex flex-col gap-4 pt-4">
          {/* KPI strip */}
          <div className="overflow-hidden rounded border border-zinc-200 bg-white">
            <div className="grid sm:grid-cols-2 xl:grid-cols-4">
              {[
                { label: "Revenue", value: formatCurrency(totalRevenue, currency), color: "text-green-600" },
                { label: "Expenses", value: formatCurrency(totalExpenses, currency), color: "text-rose-500" },
                { label: "Net Income", value: formatCurrency(netIncome, currency), color: "text-zinc-900" },
                { label: "Outstanding", value: formatCurrency(outstanding, currency), color: "text-amber-600" },
              ].map(({ label, value, color }, index) => (
                <div
                  key={label}
                  className={cn(
                    "relative px-4 py-4",
                    index > 0 && "border-t border-zinc-100 sm:border-t-0",
                    index >= 2 && "sm:border-t border-zinc-100 xl:border-t-0",
                    index % 2 === 1 && "sm:border-l-0",
                    index > 0 && "xl:border-l-0",
                    index % 2 === 1 && "sm:before:absolute sm:before:left-0 sm:before:top-5 sm:before:bottom-5 sm:before:w-px sm:before:bg-zinc-100",
                    index > 0 && "xl:before:absolute xl:before:left-0 xl:before:top-5 xl:before:bottom-5 xl:before:w-px xl:before:bg-zinc-100"
                  )}
                >
                  <p className={`text-lg font-semibold tracking-tight ${color}`}>{value}</p>
                  <p className="mt-1 text-sm text-zinc-400">{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Cashflow chart */}
          <div className="rounded border border-zinc-200 bg-white px-4 py-4">
            <h2 className="mb-5 font-semibold text-zinc-900">Monthly Cashflow</h2>
            <MonthlyCashflowChart
              months={MONTH_NAMES}
              monthlyRevenue={monthlyRevenue}
              monthlyExpenses={monthlyExpenses}
              maxBar={maxBar}
              currency={currency}
            />
          </div>

          {/* Recent paid + expenses side by side */}
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded border border-zinc-200 bg-white px-4 py-4">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-semibold text-zinc-900">Invoices</h2>
                <Link href="/finance?tab=invoices" className="text-xs text-zinc-400 hover:text-zinc-700">Manage all</Link>
              </div>
              {invoices.length === 0 ? (
                <p className="text-sm text-zinc-400">No invoices created yet.</p>
              ) : (
                <div className="space-y-2">
                  {invoices.slice(0, 6).map((inv) => (
                    <div key={inv.id} className="flex items-center justify-between rounded bg-zinc-50 px-3 py-2">
                      <div>
                        <p className="text-sm font-medium text-zinc-800">
                          {inv.invoiceNumber || `INV-${inv.id.slice(-6).toUpperCase()}`}
                        </p>
                        <p className="text-xs text-zinc-400">{inv.project?.contact?.name}</p>
                      </div>
                      <span className="text-sm font-semibold text-zinc-700">{formatCurrency(inv.total, currency)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded border border-zinc-200 bg-white px-4 py-4">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-semibold text-zinc-900">Recent Payments</h2>
                <Link href="/finance?tab=payments" className="text-xs text-zinc-400 hover:text-zinc-700">View all</Link>
              </div>
              {paid.length === 0 ? (
                <p className="text-sm text-zinc-400">No payments yet this year.</p>
              ) : (
                <div className="space-y-2">
                  {paid.slice(0, 6).map((inv) => (
                    <div key={inv.id} className="flex items-center justify-between rounded bg-zinc-50 px-3 py-2">
                      <div>
                        <p className="text-sm font-medium text-zinc-800">
                          {inv.invoiceNumber || `INV-${inv.id.slice(-6).toUpperCase()}`}
                        </p>
                        <p className="text-xs text-zinc-400">{inv.project?.contact?.name}</p>
                      </div>
                      <span className="text-sm font-semibold text-green-700">{formatCurrency(inv.total, currency)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded border border-zinc-200 bg-white px-4 py-4">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-semibold text-zinc-900">Expenses</h2>
                <Link href="/finance?tab=expenses" className="text-xs text-zinc-400 hover:text-zinc-700">View all</Link>
              </div>
              {expenses.slice(0, 6).map((exp) => (
                <div key={exp.id} className="flex items-center justify-between rounded bg-zinc-50 px-3 py-2 mb-2">
                  <div>
                    <p className="text-sm font-medium text-zinc-800">{exp.description}</p>
                    <p className="text-xs capitalize text-zinc-400">{exp.category}</p>
                  </div>
                  <span className="text-sm font-semibold text-red-600">-{formatCurrency(exp.amount, currency)}</span>
                </div>
              ))}
              {expenses.length === 0 && <p className="text-sm text-zinc-400">No expenses recorded yet.</p>}
            </div>
          </div>
        </div>
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
