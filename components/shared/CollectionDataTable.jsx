"use client";

import { useState } from "react";
import { ArrowDown, ArrowUp, ArrowUpDown, CheckSquare2, ChevronLeft, ChevronRight, Square } from "lucide-react";
import { cn } from "@/lib/utils";

const DEFAULT_PAGE_SIZE = 10;
const PAGE_SIZE_OPTIONS = [10, 25, 50];

export function CollectionTableFrame({ children, className }) {
  return (
    <div className={cn("rounded border border-zinc-200 bg-white mb-4 overflow-x-auto", className)}>
      {children}
    </div>
  );
}

function SortHeader({ align = "left", active, children, direction, onClick }) {
  const icon = !active
    ? <ArrowUpDown className="h-3.5 w-3.5" />
    : direction === "desc"
      ? <ArrowDown className="h-3.5 w-3.5" />
      : <ArrowUp className="h-3.5 w-3.5" />;

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 uppercase tracking-wider transition-colors hover:text-zinc-600",
        align === "right" ? "justify-end" : "justify-start"
      )}
    >
      <span>{children}</span>
      <span className={cn(active ? "text-zinc-700" : "text-zinc-300")}>{icon}</span>
    </button>
  );
}

function CollectionBulkActionBar({ bulkActions }) {
  if (!bulkActions?.count) return null;

  return (
    <div className="mx-4 mb-3 flex flex-wrap items-center justify-between gap-3 rounded border border-zinc-200 bg-white px-3 py-2">
      <div className="flex min-w-0 items-center gap-2">
        <span className="inline-flex items-center rounded bg-zinc-100 px-2 py-1 text-xs font-semibold text-zinc-700">
          {bulkActions.count} selected
        </span>
        {bulkActions.maxCount ? (
          <p className="text-xs text-zinc-500">Max {bulkActions.maxCount} items</p>
        ) : null}
        {bulkActions.error ? <p className="text-xs font-medium text-red-600">{bulkActions.error}</p> : null}
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        {bulkActions.actions?.map((action) => (
          <button
            key={action.key || action.label}
            type="button"
            onClick={action.onClick}
            disabled={bulkActions.isSubmitting || action.disabled}
            className={cn(
              "rounded px-2.5 py-1.5 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60",
              action.variant === "danger"
                ? "border border-red-200 text-red-600 hover:bg-red-50"
                : action.variant === "ghost"
                  ? "text-zinc-500 hover:text-zinc-800"
                  : "border border-zinc-200 text-zinc-700 hover:bg-zinc-50"
            )}
          >
            {action.label}
          </button>
        ))}
        {bulkActions.onClear ? (
          <button
            type="button"
            onClick={bulkActions.onClear}
            disabled={bulkActions.isSubmitting}
            className="rounded px-2 py-1 text-xs font-medium text-zinc-500 transition-colors hover:text-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Clear
          </button>
        ) : null}
      </div>
    </div>
  );
}

export function CollectionDataTable({
  columns,
  rows,
  renderRow,
  rowKey = "id",
  className,
  tableClassName = "w-full",
  headerRowClassName = "border-b border-zinc-200 bg-zinc-50",
  bodyClassName = "divide-y divide-zinc-200",
  bulkActions,
  selection,
  sort,
  pagination,
  isPending = false,
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [prevRowCount, setPrevRowCount] = useState(rows.length);

  // Reset to page 1 when row count changes (filter/search applied) — avoids setState-in-effect
  if (rows.length !== prevRowCount) {
    setPrevRowCount(rows.length);
    setCurrentPage(1);
  }

  // Use external pagination if provided, otherwise use built-in client-side pagination
  const useBuiltIn = !pagination && rows.length >= DEFAULT_PAGE_SIZE;
  const totalCount = rows.length;
  const totalPages = useBuiltIn ? Math.ceil(totalCount / pageSize) : 1;
  const rangeStart = useBuiltIn ? (currentPage - 1) * pageSize + 1 : 1;
  const rangeEnd = useBuiltIn ? Math.min(currentPage * pageSize, totalCount) : totalCount;
  const visibleRows = useBuiltIn
    ? rows.slice((currentPage - 1) * pageSize, currentPage * pageSize)
    : rows;

  function handlePageChange(page) {
    setCurrentPage(Math.max(1, Math.min(totalPages, page)));
  }

  function handlePageSizeChange(size) {
    setPageSize(Number(size));
    setCurrentPage(1);
  }

  return (
    <>
      <CollectionBulkActionBar bulkActions={bulkActions} />
      <CollectionTableFrame className={cn(className, isPending ? "opacity-60" : "opacity-100")}>
        <table className={tableClassName}>
          <thead className="sticky top-0 z-10">
            <tr className={headerRowClassName}>
              {selection ? (
                <th className="w-12 p-2 text-center">
                  <button
                    type="button"
                    onClick={selection.onToggleAll}
                    className="inline-flex h-5 w-5 items-center justify-center rounded text-zinc-400 transition-colors hover:text-zinc-700"
                    aria-label={selection.allVisibleSelected ? "Clear selection" : "Select visible rows"}
                  >
                    {selection.allVisibleSelected ? (
                      <CheckSquare2 className="h-4.5 w-4.5 text-blue-600" />
                    ) : (
                      <Square className="h-4.5 w-4.5" />
                    )}
                  </button>
                </th>
              ) : null}
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={cn(
                    "p-2 text-left text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-400",
                    column.headerClassName
                  )}
                >
                  {sort && column.sortable ? (
                    <SortHeader
                      align={column.align}
                      active={sort.sortBy === (column.sortKey || column.key)}
                      direction={sort.sortDir}
                      onClick={() => sort.onSortChange(column.sortKey || column.key)}
                    >
                      {column.header}
                    </SortHeader>
                  ) : (
                    column.header
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className={bodyClassName}>
            {visibleRows.map((row, index) => (
              <tr
                key={typeof rowKey === "function" ? rowKey(row, index) : row[rowKey]}
                className={cn(
                  "group hover:bg-zinc-50 transition-colors",
                  row.className,
                  selection?.isSelected?.(row) ? selection.selectedRowClassName || "bg-blue-50/60" : ""
                )}
              >
                {selection ? (
                  <td className="px-3 py-3.5 text-center">
                    <input
                      type="checkbox"
                      checked={selection.isSelected(row)}
                      disabled={selection.isRowDisabled?.(row)}
                      onChange={(event) => selection.onToggleRow(row, event.target.checked)}
                      className="h-4 w-4 rounded border-zinc-300 text-blue-600 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                      aria-label={selection.getRowLabel ? selection.getRowLabel(row) : "Select row"}
                    />
                  </td>
                ) : null}
                {renderRow(row, index)}
              </tr>
            ))}
          </tbody>
        </table>
        {pagination ? (
          <CollectionTablePagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            totalCount={pagination.totalCount}
            rangeStart={pagination.rangeStart}
            rangeEnd={pagination.rangeEnd}
            pageSize={pagination.pageSize}
            pageSizeOptions={pagination.pageSizeOptions}
            onPageSizeChange={pagination.onPageSizeChange}
            onPageChange={pagination.onPageChange}
            isPending={pagination.isPending ?? isPending}
          />
        ) : useBuiltIn ? (
          <CollectionTablePagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalCount={totalCount}
            rangeStart={rangeStart}
            rangeEnd={rangeEnd}
            pageSize={pageSize}
            pageSizeOptions={PAGE_SIZE_OPTIONS}
            onPageSizeChange={handlePageSizeChange}
            onPageChange={handlePageChange}
            isPending={isPending}
          />
        ) : null}
      </CollectionTableFrame>
    </>
  );
}

export function CollectionEmptyState({
  icon: Icon,
  title,
  description,
  action,
  compact = false,
  className,
}) {
  return (
    <CollectionTableFrame className={cn(compact ? "py-12" : "px-6 py-16", className)}>
      <div className="text-center">
        {Icon ? (
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100">
            <Icon className="h-5 w-5 text-zinc-400" />
          </div>
        ) : null}
        <h3 className="mb-2 font-semibold text-zinc-900">{title}</h3>
        {description ? <p className="text-sm text-zinc-500">{description}</p> : null}
        {action ? <div className="mt-6 flex items-center justify-center gap-2">{action}</div> : null}
      </div>
    </CollectionTableFrame>
  );
}

function buildVisiblePages(currentPage, totalPages) {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  if (currentPage <= 3) return [1, 2, 3, 4, "ellipsis-start", totalPages];
  if (currentPage >= totalPages - 2) return [1, "ellipsis-end", totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
  return [1, "ellipsis-start", currentPage - 1, currentPage, currentPage + 1, "ellipsis-end", totalPages];
}

export function CollectionTablePagination({
  currentPage,
  totalPages,
  totalCount,
  rangeStart,
  rangeEnd,
  pageSize,
  pageSizeOptions,
  onPageSizeChange,
  onPageChange,
  isPending = false,
  className,
}) {
  if (totalCount < DEFAULT_PAGE_SIZE) return null;

  const visiblePages = buildVisiblePages(currentPage, totalPages);

  return (
    <div className={cn("flex flex-col gap-3 border-t border-zinc-200 px-4 py-3 text-sm lg:flex-row lg:items-center lg:justify-between", className)}>
      <div className="flex items-center gap-4 text-xs text-zinc-500">
        <span>
          {rangeStart}–{rangeEnd} of <span className="font-medium text-zinc-700">{totalCount}</span>
        </span>
        {pageSizeOptions?.length && onPageSizeChange ? (
          <label className="flex items-center gap-1.5 text-zinc-400">
            <span>Rows per page</span>
            <select
              value={pageSize}
              onChange={(event) => onPageSizeChange(event.target.value)}
              disabled={isPending}
              className="rounded border border-zinc-200 bg-white px-2 py-1 text-xs font-medium text-zinc-600 outline-none transition-colors focus:border-zinc-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {pageSizeOptions.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </label>
        ) : null}
      </div>

      {totalPages > 1 ? (
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1 || isPending}
            className="inline-flex h-8 w-8 items-center justify-center rounded border border-zinc-200 text-zinc-500 transition-colors hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <div className="flex items-center gap-0.5">
            {visiblePages.map((pageNumber) =>
              typeof pageNumber === "number" ? (
                <button
                  key={pageNumber}
                  type="button"
                  onClick={() => onPageChange(pageNumber)}
                  disabled={isPending}
                  className={cn(
                    "inline-flex h-8 min-w-8 items-center justify-center rounded px-2 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50",
                    pageNumber === currentPage
                      ? "bg-zinc-900 text-white"
                      : "text-zinc-500 hover:bg-zinc-100"
                  )}
                >
                  {pageNumber}
                </button>
              ) : (
                <span key={pageNumber} className="inline-flex h-8 w-6 items-center justify-center text-xs text-zinc-300">
                  …
                </span>
              )
            )}
          </div>
          <button
            type="button"
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages || isPending}
            className="inline-flex h-8 w-8 items-center justify-center rounded border border-zinc-200 text-zinc-500 transition-colors hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      ) : null}
    </div>
  );
}
