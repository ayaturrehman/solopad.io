import { summarizeInvoiceMoney } from "@/lib/invoice-money";
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

  // Single query to get currency (was 2 sequential queries)
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { businessId: true, business: { select: { currency: true } } },
  });
  const currency = user?.business?.currency || "USD";
  const yearStart = new Date(now.getFullYear(), 0, 1);
  const hasExtendedExpenseModels = supportsExtendedExpenseModels();

  // Only sync recurring expenses on the expenses tab (saves ~200ms on other tabs)
  if (tab === "expenses") await syncRecurringExpenses(userId);

  // Only fetch what the active tab needs — saves 1-2 heavy queries on non-overview tabs
  const needsInvoices = tab === "overview" || tab === "invoices" || tab === "payments";
  const needsExpenses = tab === "overview" || tab === "expenses";

  const [invoices, expenses] = await Promise.all([
    needsInvoices
      ? db.invoice.findMany({
          where: { project: { userId }, createdAt: { gte: yearStart } },
          include: {
            project: { select: { title: true, contact: { select: { name: true } } } },
            payments: { where: { status: "paid" } },
            paymentPlans: { select: { id: true, label: true, amount: true, status: true, paidAt: true } },
          },
          orderBy: { createdAt: "desc" },
          take: 200,
        })
      : Promise.resolve([]),
    needsExpenses
      ? db.expense.findMany({
          where: { userId, date: { gte: yearStart } },
          include: {
            project: { select: { id: true, title: true } },
          },
          orderBy: { date: "desc" },
          take: 200,
        })
      : Promise.resolve([]),
  ]);

  // Only fetch heavy data for tabs that need it (saves 1-3 DB queries on overview/payments tabs)
  const [projects, customExpenseCategories, recurringExpenses] = await Promise.all([
    (tab === "invoices" || tab === "expenses")
      ? db.project.findMany({
          where: { userId, archived: false },
          select: { id: true, title: true },
          orderBy: { title: "asc" },
          take: 100,
        })
      : Promise.resolve([]),
    (tab === "expenses" && hasExtendedExpenseModels)
      ? db.expenseCategory.findMany({
          where: { userId },
          orderBy: { name: "asc" },
        })
      : Promise.resolve([]),
    (tab === "expenses" && hasExtendedExpenseModels)
      ? db.recurringExpense.findMany({
          where: { userId },
          include: { project: { select: { id: true, title: true } } },
          orderBy: [{ active: "desc" }, { nextDate: "asc" }],
          take: 100,
        })
      : Promise.resolve([]),
  ]);

  const expenseCategoryOptions = getExpenseCategoryOptions(customExpenseCategories);
  // Build a lookup map for category usage counts (O(n) instead of O(n*m))
  const categoryUsageMap = {};
  for (const expense of expenses) {
    if (expense.category) categoryUsageMap[expense.category] = (categoryUsageMap[expense.category] || 0) + 1;
  }
  for (const expense of recurringExpenses) {
    if (expense.category) categoryUsageMap[expense.category] = (categoryUsageMap[expense.category] || 0) + 1;
  }
  const customExpenseCategoriesWithUsage = customExpenseCategories.map((category) => ({
    ...category,
    usageCount: categoryUsageMap[category.name] || 0,
  }));

  // Paid invoices = fully paid OR has any paid milestones

  const currencyTotals = summarizeInvoiceMoney(invoices, expenses, currency);

  // New receipts keep partial bank/Stripe payment dates. Legacy invoices retain
  // their paid invoice/milestone entries without double-counting new receipts.
  const allPayments = invoices.flatMap(i => {
    if (['refunded','partially_refunded','cancelled','draft'].includes(i.status)) return [];
    if (i.payments?.length) {
      const rows = i.payments.map(p => ({ ...i, invoiceId: i.id, id: p.id, total: p.amount, paidAt: p.receivedAt, createdAt: p.receivedAt, updatedAt: p.receivedAt, paymentType: p.method === 'bank_transfer' ? 'bank transfer' : 'invoice' }));
      const legacy = Number(i.amountPaid || 0) - i.payments.reduce((sum,p)=>sum+p.amount,0);
      return legacy > 0.000001 ? [...rows, {...i, id: `${i.id}-legacy`, invoiceId: i.id, updatedAt: i.paidAt || i.createdAt, total: legacy, paymentType: 'invoice'}] : rows;
    }
    if (i.status === 'paid') return [{ ...i, invoiceId: i.id, updatedAt: i.paidAt || i.createdAt, paymentType: 'invoice' }];
    return (i.paymentPlans || []).filter(m=>m.status==='paid').map(m=>({...i,invoiceId:i.id,id:m.id,total:m.amount,updatedAt:m.paidAt||i.createdAt,paidAt:m.paidAt,createdAt:m.paidAt||i.createdAt,paymentType:'milestone'}));
  });
  const monthlyRevenue = Array(12).fill(0);
  const monthlyExpenses = Array(12).fill(0);
  allPayments.filter(i => (i.currency || currency) === currency).forEach(i => { monthlyRevenue[new Date(i.paidAt || i.createdAt).getMonth()] += i.total; });
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
            prefetch={false}
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
          currencyTotals={currencyTotals}
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
          <PaymentsClient payments={allPayments} currency={currency} />
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
