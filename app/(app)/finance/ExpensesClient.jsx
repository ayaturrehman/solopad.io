"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ChevronDown, Repeat, Search, Wallet } from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import AddExpenseForm from "./AddExpenseForm";
import ExpenseCategoriesManager from "./ExpenseCategoriesManager";

const FILTERS = ["all", "one_time", "recurring"];

function getHeaderLabel(filterKey) {
  if (filterKey === "all") return "Expenses";
  if (filterKey === "one_time") return "One-time Expenses";
  return "Recurring Expenses";
}

function getFilterLabel(filterKey) {
  if (filterKey === "all") return "All";
  if (filterKey === "one_time") return "One-time";
  return "Recurring";
}

export default function ExpensesClient({
  expenses,
  recurringExpenses,
  categories,
  projects,
  defaultCategories,
  customCategories,
  hasExtendedExpenseModels,
  recurringFrequencyLabels,
  currency = "USD",
}) {
  const searchParams = useSearchParams();
  const [filter, setFilter] = useState("all");
  const [filterOpen, setFilterOpen] = useState(false);
  const [filterSearch, setFilterSearch] = useState("");

  const query = (searchParams.get("q") || "").trim().toLowerCase();

  const filterOptions = useMemo(
    () => FILTERS.filter((filterKey) =>
      getFilterLabel(filterKey).toLowerCase().includes(filterSearch.trim().toLowerCase())
    ),
    [filterSearch]
  );

  const rows = useMemo(() => {
    const oneTimeRows = expenses.map((expense) => ({
      kind: "one_time",
      id: expense.id,
      description: expense.description,
      note: expense.note,
      category: expense.category,
      projectTitle: expense.project?.title || null,
      date: expense.date,
      amount: expense.amount,
      frequency: null,
      raw: expense,
    }));

    const recurringRows = hasExtendedExpenseModels
      ? recurringExpenses.map((expense) => ({
        kind: "recurring",
        id: expense.id,
        description: expense.description,
        note: expense.note,
        category: expense.category,
        projectTitle: expense.project?.title || null,
        date: expense.nextDate,
        amount: expense.amount,
        frequency: recurringFrequencyLabels[expense.frequency] || expense.frequency,
        raw: expense,
      }))
      : [];

    let list = [...recurringRows, ...oneTimeRows].sort(
      (a, b) => new Date(b.date) - new Date(a.date)
    );

    if (filter !== "all") {
      const expectedKind = filter === "one_time" ? "one_time" : "recurring";
      list = list.filter((item) => item.kind === expectedKind);
    }

    if (query) {
      list = list.filter((item) =>
        item.description.toLowerCase().includes(query) ||
        (item.note || "").toLowerCase().includes(query) ||
        (item.category || "").toLowerCase().includes(query) ||
        (item.projectTitle || "").toLowerCase().includes(query) ||
        (item.frequency || "").toLowerCase().includes(query)
      );
    }

    return list;
  }, [expenses, filter, hasExtendedExpenseModels, query, recurringExpenses, recurringFrequencyLabels]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="relative">
          <button
            type="button"
            onClick={() => setFilterOpen((current) => !current)}
            className="inline-flex items-center justify-between gap-2 rounded-lg bg-zinc-100 px-2 py-1 text-left text-sm text-zinc-900 transition-colors hover:bg-zinc-200"
          >
            <span className="text-lg font-bold tracking-tight">
              {getHeaderLabel(filter)}
            </span>
            <ChevronDown
              className={cn(
                "h-5 w-5 text-blue-600 transition-transform",
                filterOpen ? "rotate-180" : ""
              )}
            />
          </button>

          {filterOpen && (
            <div className="absolute left-0 top-[calc(100%+8px)] z-20 w-[15rem] max-w-[calc(100vw-2rem)] rounded-xl border border-zinc-200 bg-white p-2 shadow-xl">
              <div className="relative mb-3">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                <input
                  type="text"
                  value={filterSearch}
                  onChange={(event) => setFilterSearch(event.target.value)}
                  placeholder="Search filters"
                  className="h-11 w-full rounded-xl border border-blue-500 pl-11 pr-4 text-sm text-zinc-900 outline-none ring-0 placeholder:text-zinc-400 focus:border-blue-500"
                />
              </div>

              <div className="max-h-72 overflow-y-auto py-1">
                {filterOptions.map((filterKey) => (
                  <button
                    key={filterKey}
                    type="button"
                    onClick={() => {
                      setFilter(filterKey);
                      setFilterOpen(false);
                      setFilterSearch("");
                    }}
                    className={cn(
                      "flex w-full items-center justify-between rounded-xl px-4 py-2.5 text-left text-sm transition-colors",
                      filter === filterKey
                        ? "bg-zinc-50 text-zinc-900"
                        : "text-zinc-700 hover:bg-zinc-50"
                    )}
                  >
                    <span>{getFilterLabel(filterKey)}</span>
                    {filter === filterKey && (
                      <span className="h-2.5 w-2.5 rounded-full bg-blue-600" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {hasExtendedExpenseModels && (
            <ExpenseCategoriesManager
              defaultCategories={defaultCategories}
              customCategories={customCategories}
            />
          )}
          <AddExpenseForm categories={categories} />
        </div>
      </div>

      <div className="overflow-hidden rounded border border-zinc-200 bg-white">
        {rows.length === 0 ? (
          <p className="px-6 py-10 text-sm text-zinc-400">
            {query ? "No expenses found for that search." : "No expenses recorded yet."}
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-zinc-100 bg-zinc-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-500">Description</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-500">Project</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-500">Type</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-500">Category</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-500">Date</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-500">Frequency</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-zinc-500">Amount</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-zinc-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50">
              {rows.map((item) => (
                <tr key={`${item.kind}-${item.id}`} className="hover:bg-zinc-50">
                  <td className="px-6 py-3">
                    <p className="font-medium text-zinc-900">{item.description}</p>
                    {item.note ? <p className="mt-0.5 text-xs text-zinc-400">{item.note}</p> : null}
                  </td>
                  <td className="px-6 py-3 text-zinc-500">{item.projectTitle || "—"}</td>
                  <td className="px-6 py-3">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-600">
                      {item.kind === "recurring" ? <Repeat className="h-3 w-3" /> : <Wallet className="h-3 w-3" />}
                      {item.kind === "recurring" ? "Recurring" : "One-time"}
                    </span>
                  </td>
                  <td className="px-6 py-3 capitalize text-zinc-500">{item.category}</td>
                  <td className="px-6 py-3 text-zinc-400">{new Date(item.date).toLocaleDateString()}</td>
                  <td className="px-6 py-3 text-zinc-500">{item.frequency || "—"}</td>
                  <td className="px-6 py-3 text-right font-semibold text-zinc-900">
                    {item.kind === "one_time" ? "-" : ""}
                    {formatCurrency(item.amount, currency)}
                  </td>
                  <td className="px-6 py-3 text-right">
                    <AddExpenseForm
                      expense={item.kind === "one_time" ? item.raw : null}
                      recurringExpense={item.kind === "recurring" ? item.raw : null}
                      categories={categories}
                      projects={projects}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
