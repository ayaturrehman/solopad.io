"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import CollectionPageHeader, { collectionPageHeaderPrimaryActionClassName } from "@/components/shared/CollectionPageHeader";
import { CollectionDataTable, CollectionEmptyState } from "@/components/shared/CollectionDataTable";
import { formatCurrency, formatDate } from "@/lib/utils";

const FILTERS = [
  { key: "all",       label: "All payments" },
  { key: "thisMonth", label: "This month" },
  { key: "lastMonth", label: "Last month" },
  { key: "thisYear",  label: "This year" },
];

export default function PaymentsClient({ payments, currency }) {
  const searchParams = useSearchParams();
  const query = (searchParams.get("q") || "").trim().toLowerCase();
  const [filterKey, setFilterKey] = useState("all");
  const [filterOpen, setFilterOpen] = useState(false);
  const [filterSearch, setFilterSearch] = useState("");

  const now = new Date();
  const thisYear = now.getFullYear();
  const thisMonth = now.getMonth();

  const filterOptions = useMemo(
    () => FILTERS.filter((f) => f.label.toLowerCase().includes(filterSearch.trim().toLowerCase())),
    [filterSearch]
  );

  const filtered = useMemo(() => {
    let list = payments;

    if (filterKey === "thisMonth") {
      list = list.filter((p) => {
        const d = new Date(p.updatedAt);
        return d.getFullYear() === thisYear && d.getMonth() === thisMonth;
      });
    } else if (filterKey === "lastMonth") {
      const lm = thisMonth === 0 ? 11 : thisMonth - 1;
      const ly = thisMonth === 0 ? thisYear - 1 : thisYear;
      list = list.filter((p) => {
        const d = new Date(p.updatedAt);
        return d.getFullYear() === ly && d.getMonth() === lm;
      });
    } else if (filterKey === "thisYear") {
      list = list.filter((p) => new Date(p.updatedAt).getFullYear() === thisYear);
    }

    if (query) {
      list = list.filter((p) =>
        (p.invoiceNumber || "").toLowerCase().includes(query) ||
        (p.project?.title || "").toLowerCase().includes(query) ||
        (p.project?.contact?.name || "").toLowerCase().includes(query)
      );
    }

    return list;
  }, [payments, filterKey, query, thisYear, thisMonth]);

  const total = filtered.reduce((s, p) => s + p.total, 0);
  const headerLabel = FILTERS.find((f) => f.key === filterKey)?.label || "Payments";

  const columns = [
    { key: "invoice", header: "Invoice" },
    { key: "client", header: "Client" },
    { key: "project", header: "Project" },
    { key: "datePaid", header: "Date paid" },
    { key: "amount", header: "Amount", align: "right", headerClassName: "text-right" },
    { key: "actions", header: "" },
  ];

  return (
    <>
      <CollectionPageHeader
        title={headerLabel}
        filterOpen={filterOpen}
        onToggleFilter={() => setFilterOpen((v) => !v)}
        filterSearch={filterSearch}
        onFilterSearchChange={setFilterSearch}
        filterOptions={filterOptions.map((f) => ({ key: f.key, label: f.label }))}
        selectedFilterKey={filterKey}
        onSelectFilter={(key) => {
          setFilterKey(key);
          setFilterOpen(false);
          setFilterSearch("");
        }}
        actions={
          <Link href="/invoices/new" className={collectionPageHeaderPrimaryActionClassName}>
            New invoice
          </Link>
        }
      />

      {/* Summary strip */}
      {filtered.length > 0 && (
        <div className="mb-3 rounded-lg border border-zinc-200 bg-zinc-50/60 px-5 py-3 flex items-center justify-between">
          <p className="text-xs text-zinc-500">{filtered.length} payment{filtered.length !== 1 ? "s" : ""}</p>
          <p className="text-sm font-semibold text-green-700">{formatCurrency(total, currency)} collected</p>
        </div>
      )}

      {filtered.length === 0 ? (
        <CollectionEmptyState
          icon={CheckCircle2}
          title="No payments found"
          description="Payments appear here when invoices are marked as paid."
          className="border-dashed py-20"
        />
      ) : (
        <CollectionDataTable
          rows={filtered}
          tableClassName="w-full min-w-[520px]"
          columns={columns}
          renderRow={(inv) => (
            <>
              <td className="px-5 py-4">
                <p className="text-sm font-semibold text-zinc-900">
                  {inv.invoiceNumber || `INV-${inv.id.slice(0, 6).toUpperCase()}`}
                </p>
                <p className="text-xs text-zinc-400">{formatDate(inv.createdAt)}</p>
              </td>
              <td className="px-5 py-4 text-sm text-zinc-600">
                {inv.project?.contact?.name || "—"}
              </td>
              <td className="px-5 py-4 text-sm text-zinc-600">
                {inv.project?.title || "—"}
              </td>
              <td className="px-5 py-4 text-sm text-zinc-500">
                {formatDate(inv.paidAt)}
              </td>
              <td className="px-5 py-4 text-right text-sm font-semibold text-green-700">
                {formatCurrency(inv.total, currency)}
              </td>
              <td className="px-5 py-4 text-right">
                <Link
                  href={`/invoices/${inv.id}`}
                  className="inline-flex items-center gap-1 text-xs text-zinc-400 opacity-0 transition-opacity group-hover:opacity-100 hover:text-zinc-700"
                >
                  View <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </td>
            </>
          )}
        />
      )}
    </>
  );
}
