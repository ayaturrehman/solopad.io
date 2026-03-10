export const dynamic = "force-dynamic";

import { getSession } from "@/lib/session";
import db from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";
import AddExpenseForm from "./AddExpenseForm";
import {
  TrendingUp, TrendingDown, DollarSign, Clock,
} from "lucide-react";

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const TABS = ["overview", "payments", "expenses"];

export default async function FinancePage({ searchParams }) {
  const session = await getSession();
  if (!session?.user) redirect("/login");

  const sp = await searchParams;
  const tab = TABS.includes(sp?.tab) ? sp.tab : "overview";

  const userId = session.user.id;
  const now = new Date();
  const yearStart = new Date(now.getFullYear(), 0, 1);

  const [invoices, expenses] = await Promise.all([
    db.invoice.findMany({
      where: { project: { userId }, createdAt: { gte: yearStart } },
      include: { project: { select: { title: true, clientName: true } } },
      orderBy: { createdAt: "desc" },
    }),
    db.expense.findMany({
      where: { userId, date: { gte: yearStart } },
      orderBy: { date: "desc" },
    }),
  ]);

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

  const expenseCategories = {};
  expenses.forEach((e) => {
    expenseCategories[e.category] = (expenseCategories[e.category] || 0) + e.amount;
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">Finance</h1>
        <p className="text-sm text-zinc-500">Year-to-date overview — {now.getFullYear()}</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-zinc-200">
        {TABS.map((t) => (
          <Link
            key={t}
            href={t === "overview" ? "/finance" : `/finance?tab=${t}`}
            className={`px-4 py-2.5 text-sm font-medium capitalize transition-colors ${
              tab === t
                ? "border-b-2 border-zinc-900 text-zinc-900"
                : "text-zinc-500 hover:text-zinc-700"
            }`}
          >
            {t}
          </Link>
        ))}
      </div>

      {/* KPI cards — always visible */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: "Revenue", value: formatCurrency(totalRevenue), icon: TrendingUp, color: "text-green-600", bg: "bg-green-50" },
          { label: "Expenses", value: formatCurrency(totalExpenses), icon: TrendingDown, color: "text-red-500", bg: "bg-red-50" },
          { label: "Net Income", value: formatCurrency(netIncome), icon: DollarSign, color: "text-zinc-900", bg: "bg-zinc-100" },
          { label: "Outstanding", value: formatCurrency(outstanding), icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="rounded-xl border border-zinc-200 bg-white p-5">
            <div className={`mb-3 inline-flex rounded-lg p-2 ${bg}`}>
              <Icon className={`h-4 w-4 ${color}`} />
            </div>
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
            <p className="text-xs text-zinc-500">{label}</p>
          </div>
        ))}
      </div>

      {/* Overview tab */}
      {tab === "overview" && (
        <>
          {/* Cashflow chart */}
          <div className="rounded-xl border border-zinc-200 bg-white p-6">
            <h2 className="mb-5 font-semibold text-zinc-900">Monthly Cashflow</h2>
            <div className="flex items-end gap-2" style={{ height: 160 }}>
              {MONTH_NAMES.map((month, i) => (
                <div key={month} className="flex flex-1 flex-col items-center gap-1">
                  <div className="flex w-full flex-col gap-0.5" style={{ height: 130 }}>
                    <div className="flex-1" />
                    <div
                      className="w-full rounded-t bg-green-400 opacity-80"
                      style={{ height: `${(monthlyRevenue[i] / maxBar) * 110}px` }}
                      title={`Revenue: ${formatCurrency(monthlyRevenue[i])}`}
                    />
                    <div
                      className="w-full rounded-t bg-red-300 opacity-80"
                      style={{ height: `${(monthlyExpenses[i] / maxBar) * 110}px` }}
                      title={`Expenses: ${formatCurrency(monthlyExpenses[i])}`}
                    />
                  </div>
                  <span className="text-[10px] text-zinc-400">{month}</span>
                </div>
              ))}
            </div>
            <div className="mt-3 flex gap-4 text-xs text-zinc-500">
              <span className="flex items-center gap-1.5"><span className="inline-block h-2.5 w-2.5 rounded bg-green-400" />Revenue</span>
              <span className="flex items-center gap-1.5"><span className="inline-block h-2.5 w-2.5 rounded bg-red-300" />Expenses</span>
            </div>
          </div>

          {/* Recent paid + expenses side by side */}
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-xl border border-zinc-200 bg-white p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-semibold text-zinc-900">Recent Payments</h2>
                <Link href="/finance?tab=payments" className="text-xs text-zinc-400 hover:text-zinc-700">View all</Link>
              </div>
              {paid.length === 0 ? (
                <p className="text-sm text-zinc-400">No payments yet this year.</p>
              ) : (
                <div className="space-y-2">
                  {paid.slice(0, 6).map((inv) => (
                    <div key={inv.id} className="flex items-center justify-between rounded-lg bg-zinc-50 px-3 py-2.5">
                      <div>
                        <p className="text-sm font-medium text-zinc-800">
                          {inv.invoiceNumber || `INV-${inv.id.slice(-6).toUpperCase()}`}
                        </p>
                        <p className="text-xs text-zinc-400">{inv.project?.clientName}</p>
                      </div>
                      <span className="text-sm font-semibold text-green-700">{formatCurrency(inv.total)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-xl border border-zinc-200 bg-white p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-semibold text-zinc-900">Expenses</h2>
                <Link href="/finance?tab=expenses" className="text-xs text-zinc-400 hover:text-zinc-700">View all</Link>
              </div>
              {expenses.slice(0, 6).map((exp) => (
                <div key={exp.id} className="flex items-center justify-between rounded-lg bg-zinc-50 px-3 py-2.5 mb-2">
                  <div>
                    <p className="text-sm font-medium text-zinc-800">{exp.description}</p>
                    <p className="text-xs capitalize text-zinc-400">{exp.category}</p>
                  </div>
                  <span className="text-sm font-semibold text-red-600">-{formatCurrency(exp.amount)}</span>
                </div>
              ))}
              {expenses.length === 0 && <p className="text-sm text-zinc-400">No expenses recorded yet.</p>}
            </div>
          </div>
        </>
      )}

      {/* Payments tab */}
      {tab === "payments" && (
        <div className="rounded-xl border border-zinc-200 bg-white">
          <div className="border-b border-zinc-100 px-6 py-4">
            <h2 className="font-semibold text-zinc-900">All Payments — {now.getFullYear()}</h2>
          </div>
          {paid.length === 0 ? (
            <p className="px-6 py-10 text-sm text-zinc-400">No payments collected yet this year.</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="border-b border-zinc-100 bg-zinc-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-500">Invoice</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-500">Client</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-500">Date</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-zinc-500">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50">
                {paid.map((inv) => (
                  <tr key={inv.id} className="hover:bg-zinc-50">
                    <td className="px-6 py-3 font-medium text-zinc-900">
                      {inv.invoiceNumber || `INV-${inv.id.slice(-6).toUpperCase()}`}
                    </td>
                    <td className="px-6 py-3 text-zinc-500">{inv.project?.clientName || "—"}</td>
                    <td className="px-6 py-3 text-zinc-400">{new Date(inv.updatedAt).toLocaleDateString()}</td>
                    <td className="px-6 py-3 text-right font-semibold text-green-700">{formatCurrency(inv.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Expenses tab */}
      {tab === "expenses" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-zinc-900">Expenses — {now.getFullYear()}</h2>
            <AddExpenseForm />
          </div>

          {/* Category breakdown pills */}
          {Object.keys(expenseCategories).length > 0 && (
            <div className="flex flex-wrap gap-2">
              {Object.entries(expenseCategories).map(([cat, amt]) => (
                <div key={cat} className="rounded-full bg-zinc-100 px-3 py-1 text-xs text-zinc-600 capitalize">
                  {cat}: {formatCurrency(amt)}
                </div>
              ))}
            </div>
          )}

          <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
            {expenses.length === 0 ? (
              <p className="px-6 py-10 text-sm text-zinc-400">No expenses recorded yet.</p>
            ) : (
              <table className="w-full text-sm">
                <thead className="border-b border-zinc-100 bg-zinc-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-500">Description</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-500">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-500">Date</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-zinc-500">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-50">
                  {expenses.map((exp) => (
                    <tr key={exp.id} className="hover:bg-zinc-50">
                      <td className="px-6 py-3 font-medium text-zinc-900">{exp.description}</td>
                      <td className="px-6 py-3 capitalize text-zinc-500">{exp.category}</td>
                      <td className="px-6 py-3 text-zinc-400">{new Date(exp.date).toLocaleDateString()}</td>
                      <td className="px-6 py-3 text-right font-semibold text-red-600">-{formatCurrency(exp.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
