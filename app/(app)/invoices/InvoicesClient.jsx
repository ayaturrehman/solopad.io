"use client";

import { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  FileText, CheckCircle2, Send, Clock, XCircle, ArrowRight,
  Search, X, ChevronLeft, ChevronRight, Trash2, Mail, Printer,
  Square, CheckSquare, Filter, ChevronDown, Star, Plus,
} from "lucide-react";
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

export default function InvoicesClient({ invoices, projects }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Filters
  const [tab, setTab] = useState("all");
  const [filterOpen, setFilterOpen] = useState(false);
  const [filterSearch, setFilterSearch] = useState("");
  const [projectFilter, setProjectFilter] = useState("all");
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
    if (projectFilter !== "all") list = list.filter((i) => i.project.id === projectFilter);
    if (query) {
      const q = query;
      list = list.filter((i) =>
        (i.invoiceNumber || "").toLowerCase().includes(q) ||
        (i.project?.title || "").toLowerCase().includes(q) ||
        (i.project?.clientName || "").toLowerCase().includes(q)
      );
    }
    return list;
  }, [invoices, projectFilter, query, tab]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Reset page on filter change
  function changeTab(t) { setTab(t); setPage(1); setSelected(new Set()); }
  function changeProject(v) { setProjectFilter(v); setPage(1); setSelected(new Set()); }

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
      await fetch("/api/invoices/bulk-send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
      });
      setBulkMsg(`${ids.length} invoice${ids.length > 1 ? "s" : ""} sent.`);
      setSelected(new Set());
      router.refresh();
    } finally {
      setBulkLoading(false);
    }
  }

  function bulkPrint() {
    // Open each selected invoice in a new print tab — simplified: just window.print current view
    const ids = Array.from(selected);
    if (ids.length === 0) return;
    // For now, open first invoice in print view; a full solution would require a print layout
    ids.forEach((id) => window.open(`/invoices/${id}?print=1`, "_blank"));
  }

  async function bulkDelete() {
    if (selected.size === 0) return;
    if (!confirm(`Delete ${selected.size} invoice${selected.size > 1 ? "s" : ""}? This cannot be undone.`)) return;
    setBulkLoading(true);
    const ids = Array.from(selected);
    await Promise.all(ids.map((id) =>
      fetch(`/api/invoices/${id}`, { method: "DELETE" })
    ));
    setSelected(new Set());
    setBulkLoading(false);
    router.refresh();
  }

  const showBulkBar = selected.size > 0;

  return (
    <>
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="relative">
            <button
              type="button"
              onClick={() => setFilterOpen((current) => !current)}
              className="inline-flex items-center justify-between gap-2 rounded-lg bg-zinc-100 px-2 py-1 text-left text-sm text-zinc-900 transition-colors hover:bg-zinc-200"
            >
              <span className="text-lg font-bold tracking-tight">
                {getHeaderLabel(tab)}
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
                    onChange={(e) => setFilterSearch(e.target.value)}
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
                        changeTab(filterKey);
                        setFilterOpen(false);
                        setFilterSearch("");
                      }}
                      className={cn(
                        "flex w-full items-center justify-between rounded-xl px-4 py-2.5 text-left text-sm transition-colors",
                        tab === filterKey
                          ? "bg-zinc-50 text-zinc-900"
                          : "text-zinc-700 hover:bg-zinc-50"
                      )}
                    >
                      <span>{getFilterLabel(filterKey)}</span>
                      <span className="flex items-center gap-3">
                        <Star className="h-4 w-4 text-zinc-300" />
                        {tab === filterKey && (
                          <span className="h-2.5 w-2.5 rounded-full bg-blue-600" />
                        )}
                      </span>
                    </button>
                  ))}
                  {filterOptions.length === 0 && (
                    <div className="px-4 py-6 text-sm text-zinc-400">No filters found.</div>
                  )}
                </div>
              </div>
            )}
          </div>

          <Link
            href="/invoices/new"
            className="inline-flex items-center gap-1.5 rounded bg-zinc-900 px-3 py-2 text-sm font-semibold text-white hover:bg-zinc-700"
          >
            <Plus className="h-4 w-4" />
            New invoice
          </Link>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        {projects.length > 0 && (
          <div className="relative">
            <Filter className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400" />
            <select
              value={projectFilter}
              onChange={(e) => changeProject(e.target.value)}
              className="h-9 rounded border border-zinc-200 pl-8 pr-8 text-sm text-zinc-700 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
            >
              <option value="all">All projects</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>{p.title}</option>
              ))}
            </select>
          </div>
        )}

        <p className="text-sm text-zinc-400">{filtered.length} invoice{filtered.length !== 1 ? "s" : ""}</p>
      </div>

      {/* Bulk action bar */}
      {showBulkBar && (
        <div className="mb-3 flex items-center gap-3 rounded border border-zinc-900 bg-zinc-900 px-4 py-2.5 text-white">
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
              onClick={bulkPrint}
              className="inline-flex items-center gap-1.5 rounded-md border border-zinc-700 px-3 py-1.5 text-xs font-medium hover:bg-zinc-700"
            >
              <Printer className="h-3.5 w-3.5" /> Print
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
        <div className="mb-3 rounded border border-green-200 bg-green-50 px-4 py-2.5 text-sm text-green-700">
          {bulkMsg}
        </div>
      )}

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="rounded border border-dashed border-zinc-200 py-20 text-center">
          <FileText className="mx-auto mb-3 h-10 w-10 text-zinc-300" />
          <p className="font-medium text-zinc-500">No invoices found</p>
          <Link href="/invoices/new" className="mt-3 inline-block text-sm text-zinc-600 hover:underline">
            Create your first invoice
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded border border-zinc-200 bg-white">
          <table className="w-full">
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
                      <p className="text-xs text-zinc-400">{inv.project.clientName}</p>
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
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-zinc-500">
            Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="flex h-8 w-8 items-center justify-center rounded border border-zinc-200 text-zinc-500 hover:bg-zinc-50 disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
              .reduce((acc, p, idx, arr) => {
                if (idx > 0 && p - arr[idx - 1] > 1) acc.push("...");
                acc.push(p);
                return acc;
              }, [])
              .map((p, i) =>
                p === "..." ? (
                  <span key={`ellipsis-${i}`} className="px-1 text-zinc-400">…</span>
                ) : (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`flex h-8 w-8 items-center justify-center rounded text-sm font-medium transition-colors ${
                      page === p
                        ? "bg-zinc-900 text-white"
                        : "border border-zinc-200 text-zinc-600 hover:bg-zinc-50"
                    }`}
                  >
                    {p}
                  </button>
                )
              )}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="flex h-8 w-8 items-center justify-center rounded border border-zinc-200 text-zinc-500 hover:bg-zinc-50 disabled:opacity-40"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
