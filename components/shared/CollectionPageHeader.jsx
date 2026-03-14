"use client";

import { ChevronDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";

export const collectionPageHeaderPrimaryActionClassName = "inline-flex items-center gap-1.5 rounded bg-blue-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700";
export const collectionPageHeaderSecondaryActionClassName = "inline-flex items-center gap-1.5 rounded border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50";
export const collectionPageHeaderIconActionClassName = "inline-flex h-9 w-9 items-center justify-center rounded border border-zinc-200 bg-white text-zinc-500 transition-colors hover:bg-zinc-50 hover:text-zinc-900";
export const collectionPageHeaderSegmentedGroupClassName = "flex items-center rounded border border-zinc-200 bg-white";

export function getCollectionPageHeaderSegmentedButtonClassName(active, edge = "middle") {
  return cn(
    "inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium transition-colors",
    edge === "left" ? "rounded-l" : "",
    edge === "right" ? "rounded-r" : "",
    active ? "bg-zinc-900 text-white" : "text-zinc-500 hover:text-zinc-900"
  );
}

export default function CollectionPageHeader({
  title,
  showFilter = true,
  filterOpen = false,
  onToggleFilter,
  filterSearch = "",
  onFilterSearchChange,
  filterOptions = [],
  selectedFilterKey,
  onSelectFilter,
  actions,
  searchPlaceholder = "Search filters",
  emptyMessage = "No filters found.",
  className,
  dropdownClassName,
  titleClassName,
}) {
  const groupedFilterOptions = filterOptions.reduce((groups, option) => {
    const groupKey = option.group || "default";
    if (!groups[groupKey]) groups[groupKey] = [];
    groups[groupKey].push(option);
    return groups;
  }, {});

  return (
    <div className={cn("bg-white px-4 py-3", className)}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {showFilter ? (
          <div className="relative">
            <button
              type="button"
              onClick={onToggleFilter}
              className="inline-flex items-center justify-between gap-2 rounded px-1 py-1 text-left text-sm text-zinc-900 transition-colors hover:bg-zinc-50"
            >
              <span className={cn("text-lg font-bold tracking-tight", titleClassName)}>{title}</span>
              <ChevronDown
                className={cn(
                  "h-5 w-5 text-blue-600 transition-transform",
                  filterOpen ? "rotate-180" : ""
                )}
              />
            </button>

            {filterOpen && (
              <div
                className={cn(
                  "absolute left-0 top-[calc(100%+8px)] z-20 w-[15rem] max-w-[calc(100vw-2rem)] rounded border border-zinc-200 bg-white p-2 shadow-xl",
                  dropdownClassName
                )}
              >
                <div className="relative mb-3">
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                  <input
                    type="text"
                    value={filterSearch}
                    onChange={(event) => onFilterSearchChange?.(event.target.value)}
                    placeholder={searchPlaceholder}
                    className="h-9 w-full rounded border border-zinc-200 pl-11 pr-4 text-sm text-zinc-900 outline-none ring-0 placeholder:text-zinc-400 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
                  />
                </div>

                <div className="max-h-72 overflow-y-auto py-1">
                  {filterOptions.length > 0 ? (
                    Object.entries(groupedFilterOptions).map(([groupKey, options]) => (
                      <div key={groupKey} className="mb-1 last:mb-0">
                        {groupKey !== "default" ? (
                          <div className="px-4 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-400">
                            {groupKey}
                          </div>
                        ) : null}
                        {options.map((option) => (
                          <button
                            key={option.key}
                            type="button"
                            onClick={() => onSelectFilter?.(option.key)}
                            className={cn(
                              "flex w-full items-center justify-between rounded px-4 py-2.5 text-left text-sm transition-colors",
                              selectedFilterKey === option.key
                                ? "bg-zinc-50 text-zinc-900"
                                : "text-zinc-700 hover:bg-zinc-50"
                            )}
                          >
                            <span>{option.label}</span>
                            {selectedFilterKey === option.key && (
                              <span className="h-2.5 w-2.5 rounded-full bg-blue-600" />
                            )}
                          </button>
                        ))}
                      </div>
                    ))
                  ) : (
                    <div className="px-4 py-6 text-sm text-zinc-400">{emptyMessage}</div>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="inline-flex items-center">
            <span className={cn("text-lg font-bold tracking-tight text-zinc-900", titleClassName)}>{title}</span>
          </div>
        )}

        {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
      </div>
    </div>
  );
}
