"use client";

import { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FileText, CheckCircle2, Send, Clock, XCircle, ArrowRight,
  Search, X, ChevronLeft, ChevronRight, Trash2, Mail, Printer,
  Square, CheckSquare, Filter,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

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

export default function InvoicesClient({ invoices, projects }) {
  const router = useRouter();

  // Filters
  const [tab, setTab] = useState("all");
  const [search, setSearch] = useState("");
  const [projectFilter, setProjectFilter] = useState("all");
  const [page, setPage] = useState(1);

  // Bulk
  const [selected, setSelected] = useState(new Set());
  const [bulkLoading, setBulkLoading] = useState(false);
  const [bulkMsg, setBulkMsg] = useState("");

  // Filtered + searched list
  const filtered = useMemo(() => {
    let list = invoices;
    if (tab !== "all") list = list.filter((i) => i.status === tab);
    if (projectFilter !== "all") list = list.filter((i) => i.project.id === projectFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((i) =>
        (i.invoiceNumber || "").toLowerCase().includes(q) ||
        (i.project?.title || "").toLowerCase().includes(q) ||
        (i.project?.clientName || "").toLowerCase().includes(q)
      );
    }
    return list;
  }, [invoices, tab, search, projectFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Reset page on filter change
  function changeTab(t) { setTab(t); setPage(1); setSelected(new Set()); }
  function changeSearch(v) { setSearch(v); setPage(1); setSelected(new Set()); }
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
      {/* Tabs */}
      <div className="mb-4 flex gap-1 border-b border-zinc-200">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => changeTab(t)}
            className={`px-4 py-2.5 text-sm font-medium capitalize transition-colors ${
              tab === t
                ? "border-b-2 border-zinc-900 text-zinc-900"
                : "text-zinc-500 hover:text-zinc-700"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Search + filter row */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-48">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Search invoice #, project, client…"
            value={search}
            onChange={(e) => changeSearch(e.target.value)}
            className="h-9 w-full rounded-lg border border-zinc-200 pl-9 pr-8 text-sm placeholder:text-zinc-400 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
          />
          {search && (
            <button onClick={() => changeSearch("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600">
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Project filter */}
        {projects.length > 0 && (
          <div className="relative">
            <Filter className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400" />
            <select
              value={projectFilter}
              onChange={(e) => changeProject(e.target.value)}
              className="h-9 rounded-lg border border-zinc-200 pl-8 pr-3 text-sm text-zinc-700 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
            >
              <option value="all">All projects</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>{p.title}</option>
              ))}
            </select>
          </div>
        )}

        <p className="ml-auto text-sm text-zinc-400">{filtered.length} invoice{filtered.length !== 1 ? "s" : ""}</p>
      </div>

      {/* Bulk action bar */}
      {showBulkBar && (
        <div className="mb-3 flex items-center gap-3 rounded-lg border border-zinc-900 bg-zinc-900 px-4 py-2.5 text-white">
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
        <div className="mb-3 rounded-lg border border-green-200 bg-green-50 px-4 py-2.5 text-sm text-green-700">
          {bulkMsg}
        </div>
      )}

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-200 py-20 text-center">
          <FileText className="mx-auto mb-3 h-10 w-10 text-zinc-300" />
          <p className="font-medium text-zinc-500">No invoices found</p>
          <Link href="/invoices/new" className="mt-3 inline-block text-sm text-zinc-600 hover:underline">
            Create your first invoice
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
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
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200 text-zinc-500 hover:bg-zinc-50 disabled:opacity-40"
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
                    className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm font-medium transition-colors ${
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
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200 text-zinc-500 hover:bg-zinc-50 disabled:opacity-40"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
