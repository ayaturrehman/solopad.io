"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  FileText, CheckCircle2, Send, Clock, XCircle, ArrowRight,
  X, Trash2, Mail,
  Square, CheckSquare, Plus,
} from "lucide-react";
import CollectionPageHeader, { collectionPageHeaderPrimaryActionClassName } from "@/components/shared/CollectionPageHeader";
import { CollectionEmptyState, CollectionTableFrame, CollectionTablePagination } from "@/components/shared/CollectionDataTable";
import { cn, formatCurrency, formatDate } from "@/lib/utils";

const STATUS_CONFIG = {
  draft:     { label: "Draft",     color: "bg-zinc-100 text-zinc-500",   icon: FileText },
  sent:      { label: "Sent",      color: "bg-blue-100 text-blue-700",   icon: Send },
  paid:      { label: "Paid",      color: "bg-green-100 text-green-700", icon: CheckCircle2 },
  overdue:   { label: "Overdue",   color: "bg-red-100 text-red-700",     icon: Clock },
  cancelled: { label: "Cancelled", color: "bg-zinc-100 text-zinc-400",   icon: XCircle },
};

const TABS = ["all", "draft", "sent", "paid", "overdue"];
const PAGE_SIZE = 25;
const MAX_BULK = 20;

function getHeaderLabel(filterKey) {
  if (filterKey === "all") return "Invoices";
  return `${STATUS_CONFIG[filterKey]?.label || "All"} Invoices`;
}

function getFilterLabel(filterKey) {
  if (filterKey === "all") return "All";
  return STATUS_CONFIG[filterKey]?.label || filterKey;
}

export default function InvoicesClient({ invoices }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Filters
  const [tab, setTab] = useState("all");
  const [filterOpen, setFilterOpen] = useState(false);
  const [filterSearch, setFilterSearch] = useState("");
  const [page, setPage] = useState(1);

  // Bulk
  const [selected, setSelected] = useState(new Set());
  const [bulkLoading, setBulkLoading] = useState(false);
  const [bulkMsg, setBulkMsg] = useState("");

  const query = (searchParams.get("q") || "").trim().toLowerCase();

  const filterOptions = useMemo(
    () => TABS.filter((filterKey) =>
      getFilterLabel(filterKey).toLowerCase().includes(filterSearch.trim().toLowerCase())
    ),
    [filterSearch]
  );

  // Filtered + searched list
  const filtered = useMemo(() => {
    let list = invoices;
    if (tab !== "all") list = list.filter((i) => i.status === tab);
    if (query) {
      const q = query;
      list = list.filter((i) =>
        (i.invoiceNumber || "").toLowerCase().includes(q) ||
        (i.project?.title || "").toLowerCase().includes(q) ||
        (i.project?.contact?.name || "").toLowerCase().includes(q)
      );
    }
    return list;
  }, [invoices, query, tab]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Reset page on filter change
  function changeTab(t) { setTab(t); setPage(1); setSelected(new Set()); }
  // Selection helpers
  const selectableIds = paginated.map((i) => i.id);
  const allPageSelected = selectableIds.length > 0 && selectableIds.every((id) => selected.has(id));

  function toggleAll() {
    if (allPageSelected) {
      setSelected((prev) => {
        const n = new Set(prev);
        selectableIds.forEach((id) => n.delete(id));
        return n;
      });
    } else {
      setSelected((prev) => {
        const n = new Set(prev);
        // respect MAX_BULK
        for (const id of selectableIds) {
          if (n.size >= MAX_BULK) break;
          n.add(id);
        }
        return n;
      });
    }
  }

  function toggleOne(id) {
    setSelected((prev) => {
      const n = new Set(prev);
      if (n.has(id)) {
        n.delete(id);
      } else if (n.size < MAX_BULK) {
        n.add(id);
      }
      return n;
    });
  }

  // Bulk actions
  async function bulkSendEmail() {
    if (selected.size === 0) return;
    setBulkLoading(true);
    setBulkMsg("");
    try {
      const ids = Array.from(selected);
      const res = await fetch("/api/invoices/bulk-send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setBulkMsg(`Error: ${data.error || "Could not send invoices."}`);
        return;
      }
      setBulkMsg(`${ids.length} invoice${ids.length > 1 ? "s" : ""} sent.`);
      setSelected(new Set());
      router.refresh();
    } catch {
      setBulkMsg("Network error. Please try again.");
    } finally {
      setBulkLoading(false);
    }
  }

  async function bulkDelete() {
    if (selected.size === 0) return;
    if (!confirm(`Delete ${selected.size} invoice${selected.size > 1 ? "s" : ""}? This cannot be undone.`)) return;
    setBulkLoading(true);
    setBulkMsg("");
    const ids = Array.from(selected);
    const results = await Promise.allSettled(ids.map((id) =>
      fetch(`/api/invoices/${id}`, { method: "DELETE" }).then((res) => {
        if (!res.ok) throw new Error(`Failed to delete ${id}`);
        return res;
      })
    ));
    const failed = results.filter((r) => r.status === "rejected").length;
    const succeeded = results.length - failed;
    setSelected(new Set());
    setBulkLoading(false);
    if (failed > 0) {
      setBulkMsg(`${succeeded} deleted, ${failed} failed.`);
    }
    router.refresh();
  }

  const showBulkBar = selected.size > 0;

  return (
    <>
      <CollectionPageHeader
        title={getHeaderLabel(tab)}
        filterOpen={filterOpen}
        onToggleFilter={() => setFilterOpen((current) => !current)}
        filterSearch={filterSearch}
        onFilterSearchChange={setFilterSearch}
        filterOptions={filterOptions.map((filterKey) => ({
          key: filterKey,
          label: getFilterLabel(filterKey),
        }))}
        selectedFilterKey={tab}
        onSelectFilter={(key) => {
          changeTab(key);
          setFilterOpen(false);
          setFilterSearch("");
        }}
        actions={(
          <Link
            href="/invoices/new"
            className={collectionPageHeaderPrimaryActionClassName}
          >
            <Plus className="h-4 w-4" />
            New invoice
          </Link>
        )}
      />

      {/* Bulk action bar */}
      {showBulkBar && (
        <div className="mb-3 flex items-center gap-3 rounded border border-zinc-900 bg-zinc-900 px-3 py-2 text-white">
          <span className="text-sm font-medium">{selected.size} selected</span>
          {selected.size >= MAX_BULK && (
            <span className="text-xs text-zinc-400">(max {MAX_BULK})</span>
          )}
          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={bulkSendEmail}
              disabled={bulkLoading}
              className="inline-flex items-center gap-1.5 rounded-md border border-zinc-700 px-3 py-1.5 text-xs font-medium hover:bg-zinc-700 disabled:opacity-50"
            >
              <Mail className="h-3.5 w-3.5" /> Send email
            </button>
            <button
              onClick={bulkDelete}
              disabled={bulkLoading}
              className="inline-flex items-center gap-1.5 rounded-md border border-red-500 px-3 py-1.5 text-xs font-medium text-red-400 hover:bg-red-900/30 disabled:opacity-50"
            >
              <Trash2 className="h-3.5 w-3.5" /> Delete
            </button>
            <button
              onClick={() => setSelected(new Set())}
              className="ml-1 text-zinc-400 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {bulkMsg && (
        <div className={`mb-3 flex items-center justify-between rounded border px-3 py-2 text-sm ${bulkMsg.startsWith("Error") || bulkMsg.includes("failed") ? "border-red-200 bg-red-50 text-red-700" : "border-green-200 bg-green-50 text-green-700"}`}>
          <span>{bulkMsg}</span>
          <button
            onClick={() => { setBulkMsg(""); router.refresh(); }}
            className="ml-4 text-xs underline hover:no-underline"
          >
            Try again
          </button>
        </div>
      )}

      {/* Table */}
      <div className={bulkLoading ? "pointer-events-none opacity-60" : undefined}>
      {filtered.length === 0 ? (
        <CollectionEmptyState
          icon={FileText}
          title="No invoices found"
          action={(
            <Link href="/invoices/new" className="text-sm text-zinc-600 hover:underline">
              Create your first invoice
            </Link>
          )}
          className="border-dashed py-20"
        />
      ) : (
        <CollectionTableFrame>
          <table className="w-full min-w-[560px]">
            <thead className="border-b border-zinc-100 bg-zinc-50">
              <tr>
                <th className="w-10 px-4 py-3.5">
                  <button onClick={toggleAll} className="text-zinc-400 hover:text-zinc-600">
                    {allPageSelected
                      ? <CheckSquare className="h-4 w-4 text-zinc-900" />
                      : <Square className="h-4 w-4" />
                    }
                  </button>
                </th>
                <th className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-zinc-400">Invoice</th>
                <th className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-zinc-400">Project / Client</th>
                <th className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-zinc-400">Status</th>
                <th className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-zinc-400">Due date</th>
                <th className="px-5 py-3.5 text-right text-[11px] font-semibold uppercase tracking-wider text-zinc-400">Amount</th>
                <th className="px-5 py-3.5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50">
              {paginated.map((inv) => {
                const cfg = STATUS_CONFIG[inv.status] || STATUS_CONFIG.draft;
                const Icon = cfg.icon;
                const isSelected = selected.has(inv.id);
                return (
                  <tr
                    key={inv.id}
                    className={`group hover:bg-zinc-50/60 ${isSelected ? "bg-zinc-50" : ""}`}
                  >
                    <td className="px-4 py-4">
                      <button onClick={() => toggleOne(inv.id)} className="text-zinc-400 hover:text-zinc-900">
                        {isSelected
                          ? <CheckSquare className="h-4 w-4 text-zinc-900" />
                          : <Square className="h-4 w-4" />
                        }
                      </button>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-sm font-semibold text-zinc-900">
                        {inv.invoiceNumber || `INV-${inv.id.slice(0, 6).toUpperCase()}`}
                      </p>
                      <p className="text-xs text-zinc-400">{formatDate(inv.createdAt)}</p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-sm font-medium text-zinc-800">{inv.project.title}</p>
                      <p className="text-xs text-zinc-400">{inv.project.contact?.name || "—"}</p>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${cfg.color}`}>
                        <Icon className="h-3 w-3" />
                        {cfg.label}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm text-zinc-500">
                      {inv.dueDate ? (
                        <span className={inv.status === "overdue" ? "font-medium text-red-600" : ""}>
                          {formatDate(inv.dueDate)}
                        </span>
                      ) : (
                        <span className="text-zinc-300">—</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-right text-sm font-semibold text-zinc-900">
                      {formatCurrency(inv.total, inv.currency)}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <Link
                        href={`/invoices/${inv.id}`}
                        className="inline-flex items-center gap-1 text-xs text-zinc-400 opacity-0 transition-opacity group-hover:opacity-100 hover:text-zinc-700"
                      >
                        View <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CollectionTableFrame>
      )}

      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <CollectionTablePagination
          className="mt-4 rounded border border-zinc-200 bg-white"
          currentPage={page}
          totalPages={totalPages}
          totalCount={filtered.length}
          rangeStart={(page - 1) * PAGE_SIZE + 1}
          rangeEnd={Math.min(page * PAGE_SIZE, filtered.length)}
          onPageChange={setPage}
        />
      )}
    </>
  );
}
