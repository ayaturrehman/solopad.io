"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  FileText, CheckCircle2, Send, Clock, XCircle, ArrowRight, Plus, Mail, Trash2,
} from "lucide-react";
import Button from "@/components/ui/Button";
import CollectionPageHeader, { collectionPageHeaderPrimaryActionClassName } from "@/components/shared/CollectionPageHeader";
import { CollectionDataTable, CollectionEmptyState } from "@/components/shared/CollectionDataTable";
import { formatCurrency, formatDate } from "@/lib/utils";

const STATUS_CONFIG = {
  draft:          { label: "Draft",     color: "bg-zinc-100 text-zinc-500",   icon: FileText },
  sent:           { label: "Sent",      color: "bg-blue-100 text-blue-700",   icon: Send },
  paid:           { label: "Paid",      color: "bg-green-100 text-green-700", icon: CheckCircle2 },
  partially_paid: { label: "Partial",   color: "bg-amber-100 text-amber-700", icon: Clock },
  overdue:        { label: "Overdue",   color: "bg-red-100 text-red-700",     icon: Clock },
  cancelled:      { label: "Cancelled", color: "bg-zinc-100 text-zinc-400",   icon: XCircle },
};

function getDisplayStatus(inv) {
  if (inv.status === "paid") return "paid";
  if (inv.paymentPlans?.length > 0) {
    const paidCount = inv.paymentPlans.filter((m) => m.status === "paid").length;
    if (paidCount > 0 && paidCount < inv.paymentPlans.length) return "partially_paid";
  }
  return inv.status;
}

const TABS = ["all", "draft", "sent", "paid", "overdue"];
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

  const [tab, setTab] = useState("all");
  const [filterOpen, setFilterOpen] = useState(false);
  const [filterSearch, setFilterSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [bulkError, setBulkError] = useState("");

  const query = (searchParams.get("q") || "").trim().toLowerCase();

  const filterOptions = useMemo(
    () => TABS.filter((key) => getFilterLabel(key).toLowerCase().includes(filterSearch.trim().toLowerCase())),
    [filterSearch]
  );

  const filtered = useMemo(() => {
    let list = invoices;
    if (tab !== "all") list = list.filter((i) => i.status === tab);
    if (query) {
      list = list.filter((i) =>
        (i.invoiceNumber || "").toLowerCase().includes(query) ||
        (i.project?.title || "").toLowerCase().includes(query) ||
        (i.project?.contact?.name || "").toLowerCase().includes(query)
      );
    }
    return list;
  }, [invoices, query, tab]);

  function changeTab(t) { setTab(t); setSelectedIds([]); }

  const selectedCount = selectedIds.length;
  const canSelectMore = selectedCount < MAX_BULK;
  const allVisibleSelected = filtered.length > 0 && filtered.every((i) => selectedIds.includes(i.id));

  function toggleAllVisible() {
    if (allVisibleSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filtered.slice(0, MAX_BULK).map((i) => i.id));
    }
  }

  function toggleOne(id, checked) {
    if (checked) {
      if (canSelectMore) setSelectedIds((prev) => [...prev, id]);
    } else {
      setSelectedIds((prev) => prev.filter((x) => x !== id));
    }
  }

  async function bulkSendEmail() {
    if (selectedCount === 0) return;
    setBulkLoading(true);
    setBulkError("");
    try {
      const res = await fetch("/api/invoices/bulk-send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedIds }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setBulkError(data.error || "Could not send invoices.");
        return;
      }
      setSelectedIds([]);
      router.refresh();
    } catch {
      setBulkError("Network error. Please try again.");
    } finally {
      setBulkLoading(false);
    }
  }

  async function bulkDelete() {
    if (selectedCount === 0) return;
    if (!confirm(`Delete ${selectedCount} invoice${selectedCount > 1 ? "s" : ""}? This cannot be undone.`)) return;
    setBulkLoading(true);
    setBulkError("");
    await Promise.allSettled(selectedIds.map((id) =>
      fetch(`/api/invoices/${id}`, { method: "DELETE" })
    ));
    setSelectedIds([]);
    setBulkLoading(false);
    router.refresh();
  }

  const columns = [
    { key: "invoice", header: "Invoice" },
    { key: "project", header: "Project / Client" },
    { key: "status", header: "Status" },
    { key: "due", header: "Due date" },
    { key: "amount", header: "Amount", align: "right", headerClassName: "text-right" },
    { key: "actions", header: "" },
  ];

  return (
    <>
      <CollectionPageHeader
        title={getHeaderLabel(tab)}
        filterOpen={filterOpen}
        onToggleFilter={() => setFilterOpen((v) => !v)}
        filterSearch={filterSearch}
        onFilterSearchChange={setFilterSearch}
        filterOptions={filterOptions.map((key) => ({ key, label: getFilterLabel(key) }))}
        selectedFilterKey={tab}
        onSelectFilter={(key) => { changeTab(key); setFilterOpen(false); setFilterSearch(""); }}
        actions={
          <Link href="/invoices/new" className={collectionPageHeaderPrimaryActionClassName}>
            <Plus className="h-4 w-4" /> New invoice
          </Link>
        }
      />

      {filtered.length === 0 ? (
        <CollectionEmptyState
          icon={FileText}
          title="No invoices found"
          action={<Link href="/invoices/new" className="text-sm text-zinc-600 hover:underline">Create your first invoice</Link>}
          className="border-dashed py-20"
        />
      ) : (
        <CollectionDataTable
          rows={filtered}
          tableClassName="w-full min-w-[600px]"
          isPending={bulkLoading}
          selection={{
            allVisibleSelected,
            onToggleAll: toggleAllVisible,
            isSelected: (inv) => selectedIds.includes(inv.id),
            isRowDisabled: (inv) => !selectedIds.includes(inv.id) && !canSelectMore,
            onToggleRow: (inv, checked) => toggleOne(inv.id, checked),
            getRowLabel: (inv) => `Select ${inv.invoiceNumber || inv.id}`,
          }}
          bulkActions={{
            count: selectedCount,
            maxCount: MAX_BULK,
            error: bulkError,
            isSubmitting: bulkLoading,
            actions: [
              { key: "send", label: "Send email", onClick: bulkSendEmail },
              { key: "delete", label: "Delete", onClick: bulkDelete, variant: "danger" },
            ],
            onClear: () => { setSelectedIds([]); setBulkError(""); },
          }}
          columns={columns}
          renderRow={(inv) => {
            const displayStatus = getDisplayStatus(inv);
            const cfg = STATUS_CONFIG[displayStatus] || STATUS_CONFIG.draft;
            const Icon = cfg.icon;
            return (
              <>
                <td className="px-5 py-4">
                  <p className="text-sm font-semibold text-zinc-900">
                    {inv.invoiceNumber || `INV-${inv.id.slice(0, 6).toUpperCase()}`}
                  </p>
                  <p className="text-xs text-zinc-400">{formatDate(inv.createdAt)}</p>
                </td>
                <td className="px-5 py-4">
                  <p className="text-sm font-medium text-zinc-800">{inv.project?.title || "—"}</p>
                  <p className="text-xs text-zinc-400">{inv.project?.contact?.name || "—"}</p>
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
                  {displayStatus === "partially_paid" && (
                    <p className="text-xs font-normal text-amber-600 mt-0.5">
                      {inv.paymentPlans.filter((m) => m.status === "paid").length}/{inv.paymentPlans.length} paid
                    </p>
                  )}
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
            );
          }}
        />
      )}
    </>
  );
}
