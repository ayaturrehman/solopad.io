"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Repeat, Wallet } from "lucide-react";
import CollectionPageHeader, {
  collectionPageHeaderPrimaryActionClassName,
  collectionPageHeaderSecondaryActionClassName,
} from "@/components/shared/CollectionPageHeader";
import { CollectionDataTable, CollectionEmptyState } from "@/components/shared/CollectionDataTable";
import { formatCurrency } from "@/lib/utils";
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
    <>
      <CollectionPageHeader
        title={getHeaderLabel(filter)}
        filterOpen={filterOpen}
        onToggleFilter={() => setFilterOpen((current) => !current)}
        filterSearch={filterSearch}
        onFilterSearchChange={setFilterSearch}
        filterOptions={filterOptions.map((filterKey) => ({
          key: filterKey,
          label: getFilterLabel(filterKey),
        }))}
        selectedFilterKey={filter}
        onSelectFilter={(key) => {
          setFilter(key);
          setFilterOpen(false);
          setFilterSearch("");
        }}
        actions={(
          <>
            {hasExtendedExpenseModels && (
              <ExpenseCategoriesManager
                defaultCategories={defaultCategories}
                customCategories={customCategories}
                triggerClassName={collectionPageHeaderSecondaryActionClassName}
              />
            )}
            <AddExpenseForm categories={categories} triggerClassName={collectionPageHeaderPrimaryActionClassName} />
          </>
        )}
      />

      {rows.length === 0 ? (
        <CollectionEmptyState
          compact
          title={query ? "No expenses found for that search." : "No expenses recorded yet."}
          className="border-dashed"
        />
      ) : (
        <CollectionDataTable
          rows={rows}
          rowKey={(item) => `${item.kind}-${item.id}`}
          tableClassName="w-full min-w-[600px] text-sm"
          columns={[
            { key: "description", header: "Description", headerClassName: "px-6 text-xs normal-case tracking-normal text-zinc-500" },
            { key: "project", header: "Project", headerClassName: "px-6 text-xs normal-case tracking-normal text-zinc-500" },
            { key: "type", header: "Type", headerClassName: "px-6 text-xs normal-case tracking-normal text-zinc-500" },
            { key: "category", header: "Category", headerClassName: "px-6 text-xs normal-case tracking-normal text-zinc-500 hidden sm:table-cell" },
            { key: "date", header: "Date", headerClassName: "px-6 text-xs normal-case tracking-normal text-zinc-500" },
            { key: "frequency", header: "Frequency", headerClassName: "px-6 text-xs normal-case tracking-normal text-zinc-500" },
            { key: "amount", header: "Amount", headerClassName: "px-6 text-right text-xs normal-case tracking-normal text-zinc-500" },
            { key: "actions", header: "Actions", headerClassName: "px-6 text-right text-xs normal-case tracking-normal text-zinc-500" },
          ]}
          renderRow={(item) => (
            <>
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
            </>
          )}
        />
      )}
    </>
  );
}
