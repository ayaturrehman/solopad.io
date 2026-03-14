"use client";

import Link from "next/link";
import { formatCurrency } from "@/lib/utils";
import MonthlyCashflowChart from "./MonthlyCashflowChart";

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function delay(n) {
  return { animationDelay: `${n}ms` };
}

export default function FinanceOverviewClient({
  totalRevenue,
  totalExpenses,
  netIncome,
  outstanding,
  monthlyRevenue,
  monthlyExpenses,
  maxBar,
  currency,
  invoices,
  paid,
  expenses,
}) {
  const kpis = [
    { label: "Revenue",     value: formatCurrency(totalRevenue,  currency), color: "text-green-600" },
    { label: "Expenses",    value: formatCurrency(totalExpenses, currency), color: "text-rose-500"  },
    { label: "Net Income",  value: formatCurrency(netIncome,     currency), color: "text-zinc-900"  },
    { label: "Outstanding", value: formatCurrency(outstanding,   currency), color: "text-amber-600" },
  ];

  return (
    <div className="flex flex-col gap-4 px-4 py-4 md:px-6">

      {/* KPI strip */}
      <div
        className="dash-fade-up overflow-hidden rounded border border-zinc-200 bg-white"
        style={delay(0)}
      >
        <div className="grid sm:grid-cols-2 xl:grid-cols-4">
          {kpis.map(({ label, value, color }, i) => (
            <div
              key={label}
              className={[
                "relative px-4 py-4",
                i > 0  && "border-t border-zinc-100 sm:border-t-0",
                i >= 2 && "sm:border-t border-zinc-100 xl:border-t-0",
                i % 2 === 1 && "sm:before:absolute sm:before:left-0 sm:before:top-5 sm:before:bottom-5 sm:before:w-px sm:before:bg-zinc-100",
                i > 0  && "xl:before:absolute xl:before:left-0 xl:before:top-5 xl:before:bottom-5 xl:before:w-px xl:before:bg-zinc-100",
              ].filter(Boolean).join(" ")}
            >
              <p
                className={`dash-count text-lg font-semibold tracking-tight ${color}`}
                style={delay(80 + i * 60)}
              >
                {value}
              </p>
              <p className="mt-1 text-sm text-zinc-400">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Cashflow chart */}
      <div
        className="dash-fade-up rounded border border-zinc-200 bg-white px-4 py-4"
        style={delay(100)}
      >
        <h2 className="mb-5 font-semibold text-zinc-900">Monthly Cashflow</h2>
        <MonthlyCashflowChart
          months={MONTH_NAMES}
          monthlyRevenue={monthlyRevenue}
          monthlyExpenses={monthlyExpenses}
          maxBar={maxBar}
          currency={currency}
        />
      </div>

      {/* Recent lists */}
      <div className="grid gap-4 lg:grid-cols-2">

        {/* Invoices */}
        <div
          className="dash-fade-up rounded border border-zinc-200 bg-white px-4 py-4"
          style={delay(160)}
        >
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-zinc-900">Invoices</h2>
            <Link href="/finance?tab=invoices" className="text-xs text-zinc-400 hover:text-zinc-700">Manage all</Link>
          </div>
          {invoices.length === 0 ? (
            <p className="text-sm text-zinc-400">No invoices created yet.</p>
          ) : (
            <div className="space-y-2">
              {invoices.slice(0, 6).map((inv, i) => (
                <div
                  key={inv.id}
                  className="dash-fade-in flex items-center justify-between rounded bg-zinc-50 px-3 py-2"
                  style={delay(200 + i * 40)}
                >
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

        {/* Recent Payments */}
        <div
          className="dash-fade-up rounded border border-zinc-200 bg-white px-4 py-4"
          style={delay(200)}
        >
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-zinc-900">Recent Payments</h2>
            <Link href="/finance?tab=payments" className="text-xs text-zinc-400 hover:text-zinc-700">View all</Link>
          </div>
          {paid.length === 0 ? (
            <p className="text-sm text-zinc-400">No payments yet this year.</p>
          ) : (
            <div className="space-y-2">
              {paid.slice(0, 6).map((inv, i) => (
                <div
                  key={inv.id}
                  className="dash-fade-in flex items-center justify-between rounded bg-zinc-50 px-3 py-2"
                  style={delay(240 + i * 40)}
                >
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

        {/* Expenses */}
        <div
          className="dash-fade-up rounded border border-zinc-200 bg-white px-4 py-4"
          style={delay(240)}
        >
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-zinc-900">Expenses</h2>
            <Link href="/finance?tab=expenses" className="text-xs text-zinc-400 hover:text-zinc-700">View all</Link>
          </div>
          {expenses.length === 0 ? (
            <p className="text-sm text-zinc-400">No expenses recorded yet.</p>
          ) : (
            <div className="space-y-2">
              {expenses.slice(0, 6).map((exp, i) => (
                <div
                  key={exp.id}
                  className="dash-fade-in flex items-center justify-between rounded bg-zinc-50 px-3 py-2"
                  style={delay(280 + i * 40)}
                >
                  <div>
                    <p className="text-sm font-medium text-zinc-800">{exp.description}</p>
                    <p className="text-xs capitalize text-zinc-400">{exp.category}</p>
                  </div>
                  <span className="text-sm font-semibold text-red-600">-{formatCurrency(exp.amount, currency)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
