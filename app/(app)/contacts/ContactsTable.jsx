"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Mail, Phone, Building2, MoreHorizontal, Plus } from "lucide-react";
import { showNavigationLoading } from "@/components/shared/NavigationLoadingOverlay";
import CollectionPageHeader, {
  collectionPageHeaderIconActionClassName,
  collectionPageHeaderPrimaryActionClassName,
} from "@/components/shared/CollectionPageHeader";
import { CollectionDataTable, CollectionEmptyState } from "@/components/shared/CollectionDataTable";
import { cn, formatCurrency, isInteractiveEventTarget } from "@/lib/utils";
import ContactsImportModal from "./ContactsImportModal";
import ContactsExportModal from "./ContactsExportModal";
import ContactFormModal from "./ContactFormModal";

const STATUS_CONFIG = {
  lead:     { label: "Lead",     color: "bg-amber-50 text-amber-700" },
  active:   { label: "Client",   color: "bg-green-50 text-green-700" },
  archived: { label: "Archived", color: "bg-zinc-100 text-zinc-500" },
};

const TABS = [
  { key: "all", label: "All" },
  { key: "lead", label: "Leads" },
  { key: "active", label: "Clients" },
  { key: "archived", label: "Archived" },
];
const MAX_BULK_SELECTION = 25;
const PAGE_SIZE_OPTIONS = [10, 25, 50];
const PAGE_SIZE_STORAGE_KEY = "contacts.pageSize";

function relativeDate(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  const now = new Date();
  const diff = Math.floor((now - d) / 86400000);
  if (diff === 0) return "Today";
  if (diff === 1) return "Yesterday";
  if (diff < 30) return `${diff}d ago`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function ContactsTable({
  contacts,
  counts,
  currentPage,
  pageSize,
  query,
  status,
  sortBy,
  sortDir,
  totalCount,
  totalPages,
}) {
  const [filterOpen, setFilterOpen] = useState(false);
  const [filterSearch, setFilterSearch] = useState("");
  const [actionsOpen, setActionsOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkError, setBulkError] = useState("");
  const [isBulkSubmitting, setIsBulkSubmitting] = useState(false);
  const [isPending, startTransition] = useTransition();
  const actionsRef = useRef(null);
  const previousScopeRef = useRef(null);
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentStatus = searchParams.get("status") || status;
  const createParam = searchParams.get("create") === "1";
  const currentQuery = (searchParams.get("q") || query || "").trim();
  const currentSortBy = searchParams.get("sortBy") || sortBy;
  const currentSortDir = searchParams.get("sortDir") || sortDir;
  const currentPageSize = Number.parseInt(searchParams.get("pageSize") || `${pageSize}`, 10) || pageSize;
  const currentScopeKey = `${currentStatus}|${currentQuery}`;

  const filterOptions = useMemo(
    () => TABS.filter((option) =>
      option.label.toLowerCase().includes(filterSearch.trim().toLowerCase())
    ),
    [filterSearch]
  );

  const activeTab = TABS.find((item) => item.key === currentStatus) || TABS[0];
  const isLeadView = currentStatus === "lead";
  const rangeStart = totalCount ? (currentPage - 1) * pageSize + 1 : 0;
  const rangeEnd = Math.min(currentPage * pageSize, totalCount);
  const selectedCount = selectedIds.length;
  const visibleContactIds = contacts.map((contact) => contact.id);
  const selectedVisibleCount = visibleContactIds.filter((id) => selectedIds.includes(id)).length;
  const allVisibleSelected = visibleContactIds.length > 0 && selectedVisibleCount === visibleContactIds.length;
  const canSelectMore = selectedCount < MAX_BULK_SELECTION;

  const updateParams = useCallback((updates) => {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === undefined || value === "" || value === "all") {
        params.delete(key);
      } else {
        params.set(key, String(value));
      }
    });

    const next = params.toString();
    startTransition(() => {
      router.replace(next ? `${pathname}?${next}` : pathname, { scroll: false });
    });
  }, [pathname, router, searchParams]);

  useEffect(() => {
    if (createParam) {
      setCreateOpen(true);
    }
  }, [createParam]);

  useEffect(() => {
    if (!actionsOpen) return undefined;

    function handlePointerDown(event) {
      if (!actionsRef.current?.contains(event.target)) {
        setActionsOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [actionsOpen]);

  useEffect(() => {
    const storedValue = window.localStorage.getItem(PAGE_SIZE_STORAGE_KEY);
    const storedPageSize = Number.parseInt(storedValue || "", 10);
    if (!PAGE_SIZE_OPTIONS.includes(storedPageSize)) return;

    const hasPageSizeParam = searchParams.has("pageSize");
    if (!hasPageSizeParam && storedPageSize !== currentPageSize) {
      updateParams({ pageSize: storedPageSize, page: 1 });
      return;
    }

    window.localStorage.setItem(PAGE_SIZE_STORAGE_KEY, String(currentPageSize));
  }, [currentPageSize, searchParams, updateParams]);

  useEffect(() => {
    if (previousScopeRef.current === null) {
      previousScopeRef.current = currentScopeKey;
      return;
    }

    if (previousScopeRef.current !== currentScopeKey) {
      setSelectedIds([]);
      setBulkError("");
      previousScopeRef.current = currentScopeKey;
    }
  }, [currentScopeKey]);

  function getHeaderLabel() {
    if (currentStatus === "all") return "Contacts";
    if (currentStatus === "lead") return "Lead Contacts";
    if (currentStatus === "active") return "Client Contacts";
    return "Archived Contacts";
  }

  function handleCreateModalChange(nextOpen) {
    setCreateOpen(nextOpen);
    if (!nextOpen && createParam) {
      updateParams({ create: null });
    }
  }

  function handleRowDoubleClick(event, href) {
    if (isInteractiveEventTarget(event.target)) return;
    showNavigationLoading();
    router.push(href);
  }

  function toggleSort(column) {
    const isCurrentColumn = currentSortBy === column;

    if (!isCurrentColumn) {
      updateParams({ sortBy: column, sortDir: "asc", page: 1 });
      return;
    }

    if (currentSortDir === "asc") {
      updateParams({ sortBy: column, sortDir: "desc", page: 1 });
      return;
    }

    updateParams({ sortBy: null, sortDir: null, page: 1 });
  }

  function handleSelectContact(contactId, checked) {
    setBulkError("");
    setSelectedIds((current) => {
      if (!checked) {
        return current.filter((id) => id !== contactId);
      }

      if (current.includes(contactId)) {
        return current;
      }

      if (current.length >= MAX_BULK_SELECTION) {
        setBulkError(`You can select up to ${MAX_BULK_SELECTION} contacts at a time.`);
        return current;
      }

      return [...current, contactId];
    });
  }

  function handleToggleVisibleSelection() {
    setBulkError("");
    setSelectedIds((current) => {
      if (allVisibleSelected) {
        return current.filter((id) => !visibleContactIds.includes(id));
      }

      const next = [...current];
      for (const contactId of visibleContactIds) {
        if (next.includes(contactId)) continue;
        if (next.length >= MAX_BULK_SELECTION) {
          setBulkError(`You can select up to ${MAX_BULK_SELECTION} contacts at a time.`);
          break;
        }
        next.push(contactId);
      }

      return next;
    });
  }

  async function handleBulkAction(action, nextStatus) {
    if (selectedCount === 0 || isBulkSubmitting) return;

    if (action === "delete") {
      const confirmed = window.confirm(
        `Delete ${selectedCount} selected contact${selectedCount === 1 ? "" : "s"}?`
      );
      if (!confirmed) return;
    }

    setBulkError("");
    setIsBulkSubmitting(true);

    try {
      const res = await fetch("/api/contacts/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          ids: selectedIds,
          ...(nextStatus ? { status: nextStatus } : {}),
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.error || "Bulk action failed.");
      }

      setSelectedIds([]);
      router.refresh();
    } catch (error) {
      setBulkError(error.message || "Bulk action failed.");
    } finally {
      setIsBulkSubmitting(false);
    }
  }

  return (
    <>
      <CollectionPageHeader
        title={getHeaderLabel()}
        filterOpen={filterOpen}
        onToggleFilter={() => setFilterOpen((current) => !current)}
        filterSearch={filterSearch}
        onFilterSearchChange={setFilterSearch}
        filterOptions={filterOptions}
        selectedFilterKey={currentStatus}
        onSelectFilter={(key) => {
          updateParams({ status: key, page: 1 });
          setFilterOpen(false);
          setFilterSearch("");
        }}
        actions={(
          <>
            <button
              type="button"
              onClick={() => setCreateOpen(true)}
              className={collectionPageHeaderPrimaryActionClassName}
            >
              <Plus className="h-4 w-4" />
              New contact
            </button>
            <div className="relative" ref={actionsRef}>
              <button
                type="button"
                onClick={() => setActionsOpen((current) => !current)}
                className={cn(collectionPageHeaderIconActionClassName, "h-8 w-8")}
                aria-label="More contact actions"
              >
                <MoreHorizontal className="h-4 w-4" />
              </button>

              {actionsOpen && (
                <div className="absolute right-0 top-9 z-30 w-52 overflow-hidden rounded border border-zinc-200 bg-white shadow-lg">
                  <button
                    type="button"
                    onClick={() => {
                      setActionsOpen(false);
                      setImportOpen(true);
                    }}
                    className="flex w-full items-center px-3 py-2.5 text-left text-sm text-zinc-700"
                  >
                    Import contacts
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setActionsOpen(false);
                      setExportOpen(true);
                    }}
                    className="flex w-full items-center px-3 py-2.5 text-left text-sm text-zinc-700"
                  >
                    Export contacts
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      />

      <ContactsImportModal
        hideTrigger
        open={importOpen}
        onOpenChange={setImportOpen}
      />
      <ContactFormModal
        open={createOpen}
        onOpenChange={handleCreateModalChange}
      />
      <ContactsExportModal
        hideTrigger
        open={exportOpen}
        onOpenChange={setExportOpen}
        query={currentQuery}
        status={currentStatus}
      />

      {totalCount === 0 ? (
        counts.all === 0 ? (
          <CollectionEmptyState
            icon={Plus}
            title="No contacts yet"
            description="Add your first client or lead to keep track of your relationships."
            action={(
              <>
                <ContactsImportModal buttonLabel="Import contacts" />
                <button
                  type="button"
                  onClick={() => setCreateOpen(true)}
                  className={collectionPageHeaderPrimaryActionClassName}
                >
                  <Plus className="h-4 w-4" />
                  Add first contact
                </button>
              </>
            )}
          />
        ) : (
          <CollectionEmptyState
            compact
            title={currentQuery ? `No results for "${currentQuery}"` : `No ${activeTab.label.toLowerCase()} yet`}
            className="border-dashed"
          />
        )
      ) : (
        <CollectionDataTable
          rows={contacts}
          tableClassName="w-full min-w-[600px] text-sm"
          isPending={isPending}
          selection={{
            allVisibleSelected,
            onToggleAll: handleToggleVisibleSelection,
            isSelected: (contact) => selectedIds.includes(contact.id),
            isRowDisabled: (contact) => !selectedIds.includes(contact.id) && !canSelectMore,
            onToggleRow: (contact, checked) => handleSelectContact(contact.id, checked),
            getRowLabel: (contact) => `Select ${contact.name}`,
          }}
          bulkActions={{
            count: selectedCount,
            maxCount: MAX_BULK_SELECTION,
            error: bulkError,
            isSubmitting: isBulkSubmitting,
            actions: [
              { key: "lead", label: "Mark as lead", onClick: () => handleBulkAction("updateStatus", "lead") },
              { key: "active", label: "Mark as client", onClick: () => handleBulkAction("updateStatus", "active") },
              { key: "archived", label: "Archive", onClick: () => handleBulkAction("updateStatus", "archived") },
              { key: "delete", label: isBulkSubmitting ? "Working..." : "Delete", onClick: () => handleBulkAction("delete"), variant: "danger" },
            ],
            onClear: () => {
              setSelectedIds([]);
              setBulkError("");
            },
          }}
          sort={{
            sortBy: currentSortBy,
            sortDir: currentSortDir,
            onSortChange: toggleSort,
          }}
          pagination={totalCount > 0 ? {
            currentPage,
            totalPages,
            totalCount,
            rangeStart,
            rangeEnd,
            pageSize: currentPageSize,
            pageSizeOptions: PAGE_SIZE_OPTIONS,
            onPageSizeChange: (nextPageSize) => {
              window.localStorage.setItem(PAGE_SIZE_STORAGE_KEY, nextPageSize);
              updateParams({ pageSize: nextPageSize, page: 1 });
            },
            onPageChange: (nextPage) => updateParams({ page: nextPage }),
            isPending,
          } : null}
          columns={[
            { key: "name", header: "Name", sortable: true },
            { key: "company", header: "Company", sortable: true },
            { key: "contact", header: "Contact" },
            ...(isLeadView
              ? [
                { key: "source", header: "Source", sortable: true },
                { key: "value", header: "Est. value", sortable: true, align: "right", headerClassName: "text-right" },
              ]
              : [
                { key: "projects", header: "Projects", headerClassName: "text-center" },
              ]),
            { key: "createdAt", header: "Added", sortable: true },
            ...(currentStatus === "all"
              ? [{ key: "status", header: "Type", sortable: true }]
              : []),
            { key: "actions", header: "", headerClassName: "w-16" },
          ]}
          renderRow={(contact) => {
            const sc = STATUS_CONFIG[contact.status] ?? STATUS_CONFIG.lead;
            return (
              <>
                <td
                  onDoubleClick={(event) => handleRowDoubleClick(event, `/contacts/${contact.id}`)}
                  className="cursor-pointer px-5 py-3.5"
                >
                  <Link href={`/contacts/${contact.id}`} className="font-medium text-zinc-900 hover:underline">
                    {contact.name}
                  </Link>
                </td>
                <td
                  onDoubleClick={(event) => handleRowDoubleClick(event, `/contacts/${contact.id}`)}
                  className="cursor-pointer px-5 py-3.5 text-zinc-700"
                >
                  {contact.company ? (
                    <span className="flex items-center gap-1.5">
                      <Building2 className="h-3.5 w-3.5 shrink-0 text-zinc-400" />
                      {contact.company}
                    </span>
                  ) : (
                    <span className="text-zinc-400">—</span>
                  )}
                </td>
                <td
                  onDoubleClick={(event) => handleRowDoubleClick(event, `/contacts/${contact.id}`)}
                  className="cursor-pointer px-5 py-3.5"
                >
                  <div className="space-y-0.5">
                    {contact.email && (
                      <div className="flex items-center gap-1.5 text-xs text-zinc-700">
                        <Mail className="h-3 w-3 shrink-0 text-zinc-400" />
                        {contact.email}
                      </div>
                    )}
                    {contact.phone && (
                      <div className="flex items-center gap-1.5 text-xs text-zinc-700">
                        <Phone className="h-3 w-3 shrink-0 text-zinc-400" />
                        {contact.phone}
                      </div>
                    )}
                    {!contact.email && !contact.phone && <span className="text-zinc-400">—</span>}
                  </div>
                </td>
                {isLeadView ? (
                  <td
                    onDoubleClick={(event) => handleRowDoubleClick(event, `/contacts/${contact.id}`)}
                    className="cursor-pointer px-5 py-3.5 text-sm capitalize text-zinc-700"
                  >
                    {contact.source || <span className="text-zinc-400">—</span>}
                  </td>
                ) : (
                  <td
                    onDoubleClick={(event) => handleRowDoubleClick(event, `/contacts/${contact.id}`)}
                    className="cursor-pointer px-5 py-3.5 text-center text-zinc-700"
                  >
                    {contact._count?.projects > 0 ? (
                      <span className="font-medium text-zinc-900">{contact._count.projects}</span>
                    ) : (
                      <span className="text-zinc-400">0</span>
                    )}
                  </td>
                )}
                {isLeadView ? (
                  <td
                    onDoubleClick={(event) => handleRowDoubleClick(event, `/contacts/${contact.id}`)}
                    className="cursor-pointer px-5 py-3.5 text-right text-sm font-semibold text-zinc-900"
                  >
                    {contact.value ? formatCurrency(contact.value) : <span className="font-normal text-zinc-400">—</span>}
                  </td>
                ) : null}
                <td
                  onDoubleClick={(event) => handleRowDoubleClick(event, `/contacts/${contact.id}`)}
                  className="cursor-pointer px-5 py-3.5 text-xs text-zinc-600"
                >
                  {relativeDate(contact.createdAt)}
                </td>
                {currentStatus === "all" ? (
                  <td
                    onDoubleClick={(event) => handleRowDoubleClick(event, `/contacts/${contact.id}`)}
                    className="cursor-pointer px-5 py-3.5"
                  >
                    <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-semibold", sc.color)}>
                      {sc.label}
                    </span>
                  </td>
                ) : null}
                <td className="px-5 py-3.5 text-right">
                  <Link
                    href={`/contacts/${contact.id}`}
                    className="rounded border border-zinc-200 px-2.5 py-1 text-xs font-medium text-zinc-600 hover:bg-zinc-50"
                  >
                    View
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
