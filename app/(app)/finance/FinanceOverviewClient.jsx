"use client";

import { formatCurrency, formatCurrencyTotals } from "@/lib/utils";
import { StatCard, StatCardGrid, RecentList } from "@/components/shared/StatCard";
import MonthlyCashflowChart from "./MonthlyCashflowChart";
import { Card } from "@/components/ui/Card";

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export default function FinanceOverviewClient({
  currencyTotals,
  monthlyRevenue,
  monthlyExpenses,
  maxBar,
  currency,
  invoices,
  paid,
  expenses,
}) {
  const totalLabel = key => currencyTotals[key].length
    ? formatCurrencyTotals(currencyTotals[key])
    : formatCurrency(0, currency);
  const kpis = [
    { label: "Revenue", value: totalLabel("revenue"), color: "text-green-600" },
    { label: "Expenses", value: totalLabel("expenses"), color: "text-rose-500" },
    { label: "Net Income", value: totalLabel("netIncome"), color: "text-zinc-900" },
    { label: "Outstanding", value: totalLabel("outstanding"), color: "text-amber-600" },
  ];

  return (
    <div className="flex flex-col gap-6 px-4 py-4 md:px-6">

      {/* KPI cards */}
      <StatCardGrid>
        {kpis.map((kpi, i) => (
          <StatCard key={kpi.label} {...kpi} delay={80 + i * 60} />
        ))}
      </StatCardGrid>

      {/* Cashflow chart */}
      <Card className="dash-fade-up px-4 py-4" style={{ animationDelay: "100ms" }}>
        <h2 className="mb-5 font-semibold text-zinc-900">Monthly Cashflow · {currency}</h2>
        <p className="mb-4 text-xs text-zinc-500">The chart shows {currency} only. Totals above keep each currency separate.</p>
        <MonthlyCashflowChart
          months={MONTH_NAMES}
          monthlyRevenue={monthlyRevenue}
          monthlyExpenses={monthlyExpenses}
          maxBar={maxBar}
          currency={currency}
        />
      </Card>

      {/* Recent lists */}
      <div className="grid gap-6 lg:grid-cols-2">
        <RecentList
          title="Invoices"
          href="/finance?tab=invoices"
          linkLabel="Manage all"
          items={invoices}
          emptyText="No invoices created yet."
          delay={160}
          renderItem={(inv) => (
            <>
              <div>
                <p className="text-sm font-medium text-zinc-800">
                  {inv.invoiceNumber || `INV-${inv.id.slice(-6).toUpperCase()}`}
                </p>
                <p className="text-xs text-zinc-400">{inv.project?.contact?.name}</p>
              </div>
              <span className="text-sm font-semibold text-zinc-700">{formatCurrency(inv.total, inv.currency || currency)}</span>
            </>
          )}
        />

        <RecentList
          title="Recent Payments"
          href="/finance?tab=payments"
          items={paid}
          emptyText="No payments yet this year."
          delay={200}
          renderItem={(inv) => (
            <>
              <div>
                <p className="text-sm font-medium text-zinc-800">
                  {inv.invoiceNumber || `INV-${inv.id.slice(-6).toUpperCase()}`}
                </p>
                <p className="text-xs text-zinc-400">{inv.project?.contact?.name}</p>
              </div>
              <span className="text-sm font-semibold text-green-700">{formatCurrency(inv.total, inv.currency || currency)}</span>
            </>
          )}
        />

        <RecentList
          title="Expenses"
          href="/finance?tab=expenses"
          items={expenses}
          emptyText="No expenses recorded yet."
          delay={240}
          renderItem={(exp) => (
            <>
              <div>
                <p className="text-sm font-medium text-zinc-800">{exp.description}</p>
                <p className="text-xs capitalize text-zinc-400">{exp.category}</p>
              </div>
              <span className="text-sm font-semibold text-red-600">-{formatCurrency(exp.amount, currency)}</span>
            </>
          )}
        />
      </div>
    </div>
  );
}
