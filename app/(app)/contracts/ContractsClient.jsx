"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  FileSignature, Plus,
} from "lucide-react";
import { showNavigationLoading } from "@/components/shared/NavigationLoadingOverlay";
import CollectionPageHeader, { collectionPageHeaderPrimaryActionClassName } from "@/components/shared/CollectionPageHeader";
import { CollectionDataTable, CollectionEmptyState } from "@/components/shared/CollectionDataTable";
import { cn, formatDate, isInteractiveEventTarget } from "@/lib/utils";

const STATUS_CONFIG = {
  all: { label: "All" },
  draft: { label: "Draft", color: "bg-zinc-100 text-zinc-600" },
  sent: { label: "Sent", color: "bg-blue-100 text-blue-700" },
  signed: { label: "Signed", color: "bg-green-100 text-green-700" },
};

const FILTERS = ["all", "draft", "sent", "signed"];

function getHeaderLabel(filterKey) {
  if (filterKey === "all") return "Contracts";
  return `${STATUS_CONFIG[filterKey].label} Contracts`;
}

function getFilterLabel(filterKey) {
  if (filterKey === "all") return "All";
  return STATUS_CONFIG[filterKey].label;
}

export default function ContractsClient({ contracts }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [statusFilter, setStatusFilter] = useState("all");
  const [filterOpen, setFilterOpen] = useState(false);
  const [filterSearch, setFilterSearch] = useState("");

  const query = (searchParams.get("q") || "").trim().toLowerCase();

  const filterOptions = useMemo(
    () => FILTERS.filter((filterKey) =>
      STATUS_CONFIG[filterKey].label.toLowerCase().includes(filterSearch.trim().toLowerCase())
    ),
    [filterSearch]
  );

  const filtered = useMemo(() => {
    let list = statusFilter === "all"
      ? contracts
      : contracts.filter((c) => c.status === statusFilter);

    if (!query) return list;

    return list.filter((contract) =>
      contract.title.toLowerCase().includes(query) ||
      (contract.clientName || "").toLowerCase().includes(query) ||
      (contract.clientEmail || "").toLowerCase().includes(query) ||
      (contract.project?.title || "").toLowerCase().includes(query)
    );
  }, [contracts, query, statusFilter]);

  function handleRowDoubleClick(event, href) {
    if (isInteractiveEventTarget(event.target)) return;
    showNavigationLoading();
    router.push(href);
  }

  return (
    <div>
      <CollectionPageHeader
        title={getHeaderLabel(statusFilter)}
        filterOpen={filterOpen}
        onToggleFilter={() => setFilterOpen((current) => !current)}
        filterSearch={filterSearch}
        onFilterSearchChange={setFilterSearch}
        filterOptions={filterOptions.map((filterKey) => ({
          key: filterKey,
          label: getFilterLabel(filterKey),
        }))}
        selectedFilterKey={statusFilter}
        onSelectFilter={(key) => {
          setStatusFilter(key);
          setFilterOpen(false);
          setFilterSearch("");
        }}
        actions={(
          <Link
            href="/contracts/new"
            className={collectionPageHeaderPrimaryActionClassName}
          >
            <Plus className="h-4 w-4" />
            New contract
          </Link>
        )}
      />

      {filtered.length === 0 ? (
        <CollectionEmptyState
          icon={FileSignature}
          title={contracts.length === 0 ? "No contracts yet" : "No contracts found"}
          description={contracts.length === 0
            ? "Create a contract template to get started"
            : "Try a different filter or top search term"}
          action={(
            <Link
              href="/contracts/new"
              className={collectionPageHeaderPrimaryActionClassName}
            >
              <Plus className="h-4 w-4" />
              New contract
            </Link>
          )}
          className="border-dashed"
        />
      ) : (
        <CollectionDataTable
          rows={filtered}
          tableClassName="w-full min-w-[600px]"
          columns={[
            { key: "title", header: "Title" },
            { key: "client", header: "Client" },
            { key: "project", header: "Project" },
            { key: "status", header: "Status" },
            { key: "sentAt", header: "Sent" },
            { key: "signedAt", header: "Signed" },
            { key: "createdAt", header: "Created" },
          ]}
          renderRow={(contract) => {
            const sc = STATUS_CONFIG[contract.status] ?? STATUS_CONFIG.draft;
            return (
              <>
                <td
                  onDoubleClick={(event) => handleRowDoubleClick(event, `/contracts/${contract.id}`)}
                  className="cursor-pointer px-5 py-3.5"
                >
                  <p className="text-sm font-medium text-zinc-900">{contract.title}</p>
                  {contract.clientEmail && <p className="mt-0.5 text-xs text-zinc-400">{contract.clientEmail}</p>}
                </td>
                <td
                  onDoubleClick={(event) => handleRowDoubleClick(event, `/contracts/${contract.id}`)}
                  className="cursor-pointer px-5 py-3.5 text-sm text-zinc-600"
                >
                  {contract.clientName}
                </td>
                <td
                  onDoubleClick={(event) => handleRowDoubleClick(event, `/contracts/${contract.id}`)}
                  className="cursor-pointer px-5 py-3.5 text-sm"
                >
                  {contract.project ? (
                    <Link prefetch={false} href={`/projects/${contract.project.id}`} className="text-zinc-600 underline underline-offset-2 hover:text-zinc-900">
                      {contract.project.title}
                    </Link>
                  ) : (
                    <span className="text-zinc-300">—</span>
                  )}
                </td>
                <td
                  onDoubleClick={(event) => handleRowDoubleClick(event, `/contracts/${contract.id}`)}
                  className="cursor-pointer px-5 py-3.5"
                >
                  <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold", sc.color)}>
                    {sc.label}
                  </span>
                </td>
                <td
                  onDoubleClick={(event) => handleRowDoubleClick(event, `/contracts/${contract.id}`)}
                  className="cursor-pointer px-5 py-3.5 text-sm text-zinc-500"
                >
                  {contract.sentAt ? formatDate(contract.sentAt) : <span className="text-zinc-300">—</span>}
                </td>
                <td
                  onDoubleClick={(event) => handleRowDoubleClick(event, `/contracts/${contract.id}`)}
                  className="cursor-pointer px-5 py-3.5 text-sm text-zinc-500"
                >
                  {contract.signedAt ? formatDate(contract.signedAt) : <span className="text-zinc-300">—</span>}
                </td>
                <td
                  onDoubleClick={(event) => handleRowDoubleClick(event, `/contracts/${contract.id}`)}
                  className="cursor-pointer px-5 py-3.5 text-sm text-zinc-500"
                >
                  {formatDate(contract.createdAt)}
                </td>
              </>
            );
          }}
        />
      )}
    </div>
  );
}
