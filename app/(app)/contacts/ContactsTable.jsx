"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Search, Mail, Phone, Building2, ChevronDown, Plus, Star } from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";

const STATUS_CONFIG = {
  lead:     { label: "Lead",     color: "bg-amber-50 text-amber-700" },
  active:   { label: "Client",   color: "bg-green-50 text-green-700" },
  archived: { label: "Archived", color: "bg-zinc-100 text-zinc-500" },
};

const TABS = [
  { key: "all",      label: "All" },
  { key: "lead",     label: "Leads" },
  { key: "active",   label: "Clients" },
  { key: "archived", label: "Archived" },
];

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

export default function ContactsTable({ contacts }) {
  const [tab, setTab] = useState("all");
  const [filterOpen, setFilterOpen] = useState(false);
  const [filterSearch, setFilterSearch] = useState("");
  const searchParams = useSearchParams();
  const query = (searchParams.get("q") || "").trim().toLowerCase();

  const filterOptions = useMemo(
    () => TABS.filter((option) =>
      option.label.toLowerCase().includes(filterSearch.trim().toLowerCase())
    ),
    [filterSearch]
  );

  const byTab = tab === "all" ? contacts : contacts.filter((c) => c.status === tab);
  const filtered = query
    ? byTab.filter((c) =>
        [c.name, c.email, c.company, c.phone]
          .filter(Boolean)
          .some((v) => v.toLowerCase().includes(query))
      )
    : byTab;

  const counts = {
    all: contacts.length,
    lead: contacts.filter((c) => c.status === "lead").length,
    active: contacts.filter((c) => c.status === "active").length,
    archived: contacts.filter((c) => c.status === "archived").length,
  };
  const activeTab = TABS.find((item) => item.key === tab) || TABS[0];
  const isLeadView = tab === "lead";

  function getHeaderLabel() {
    if (tab === "all") return "Contacts";
    if (tab === "lead") return "Leads";
    if (tab === "active") return "Clients";
    return "Archived Contacts";
  }

  return (
    <div className="space-y-4">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="relative">
            <button
              type="button"
              onClick={() => setFilterOpen((current) => !current)}
              className="inline-flex items-center justify-between gap-2 rounded-lg bg-zinc-100 px-2 py-1 text-left text-sm text-zinc-900 transition-colors hover:bg-zinc-200"
            >
              <span className="text-lg font-bold tracking-tight">{getHeaderLabel()}</span>
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
                  {filterOptions.map((option) => (
                    <button
                      key={option.key}
                      type="button"
                      onClick={() => {
                        setTab(option.key);
                        setFilterOpen(false);
                        setFilterSearch("");
                      }}
                      className={cn(
                        "flex w-full items-center justify-between rounded-xl px-4 py-2.5 text-left text-sm transition-colors",
                        tab === option.key
                          ? "bg-zinc-50 text-zinc-900"
                          : "text-zinc-700 hover:bg-zinc-50"
                      )}
                    >
                      <span>{option.label}</span>
                      <span className="flex items-center gap-3">
                        <Star className="h-4 w-4 text-zinc-300" />
                        {tab === option.key && <span className="h-2.5 w-2.5 rounded-full bg-blue-600" />}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {contacts.length > 0 && (
            <Link
              href="/contacts/new"
              className="inline-flex items-center gap-1.5 rounded bg-zinc-900 px-3 py-2 text-sm font-semibold text-white hover:bg-zinc-700"
            >
              <Plus className="h-4 w-4" />
              Add contact
            </Link>
          )}
        </div>
      </div>

      {filtered.length === 0 ? (
        contacts.length === 0 ? (
          <div className="rounded border border-dashed border-zinc-200 bg-white px-6 py-16 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100">
              <Plus className="h-5 w-5 text-zinc-400" />
            </div>
            <h3 className="mb-2 font-semibold text-zinc-900">No contacts yet</h3>
            <p className="mb-6 text-sm text-zinc-500">Add your first client or lead to keep track of your relationships.</p>
            <Link
              href="/contacts/new"
              className="inline-flex items-center gap-2 rounded bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700"
            >
              <Plus className="h-4 w-4" />
              Add first contact
            </Link>
          </div>
        ) : (
          <div className="rounded border border-dashed border-zinc-200 bg-white py-12 text-center">
            <p className="text-sm text-zinc-400">
              {query ? `No results for "${searchParams.get("q")}"` : `No ${activeTab.label.toLowerCase()} yet`}
            </p>
          </div>
        )
      ) : (
        <div className="overflow-hidden rounded border border-zinc-200 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-100 bg-zinc-50">
                <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-zinc-400">Name</th>
                <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-zinc-400">Company</th>
                <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-zinc-400">Contact</th>
                {isLeadView && <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-zinc-400">Source</th>}
                {isLeadView && <th className="px-5 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-zinc-400">Est. value</th>}
                {!isLeadView && <th className="px-5 py-3 text-center text-[11px] font-semibold uppercase tracking-wider text-zinc-400">Projects</th>}
                <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-zinc-400">Added</th>
                {tab === "all" && <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-zinc-400">Type</th>}
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {filtered.map((contact) => {
                const sc = STATUS_CONFIG[contact.status] ?? STATUS_CONFIG.lead;
                return (
                  <tr key={contact.id} className="group hover:bg-zinc-50 transition-colors">
                    <td className="px-5 py-3.5">
                      <Link href={`/contacts/${contact.id}`} className="font-medium text-zinc-900 hover:underline">
                        {contact.name}
                      </Link>
                    </td>
                    <td className="px-5 py-3.5 text-zinc-500">
                      {contact.company ? (
                        <span className="flex items-center gap-1.5">
                          <Building2 className="h-3.5 w-3.5 shrink-0 text-zinc-400" />
                          {contact.company}
                        </span>
                      ) : (
                        <span className="text-zinc-300">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="space-y-0.5">
                        {contact.email && (
                          <div className="flex items-center gap-1.5 text-zinc-500 text-xs">
                            <Mail className="h-3 w-3 shrink-0 text-zinc-400" />
                            {contact.email}
                          </div>
                        )}
                        {contact.phone && (
                          <div className="flex items-center gap-1.5 text-zinc-500 text-xs">
                            <Phone className="h-3 w-3 shrink-0 text-zinc-400" />
                            {contact.phone}
                          </div>
                        )}
                        {!contact.email && !contact.phone && <span className="text-zinc-300">—</span>}
                      </div>
                    </td>
                    {isLeadView && (
                      <td className="px-5 py-3.5 text-sm text-zinc-500 capitalize">
                        {contact.source || <span className="text-zinc-300">—</span>}
                      </td>
                    )}
                    {isLeadView && (
                      <td className="px-5 py-3.5 text-right text-sm font-semibold text-zinc-900">
                        {contact.value ? formatCurrency(contact.value) : <span className="text-zinc-300 font-normal">—</span>}
                      </td>
                    )}
                    {!isLeadView && (
                      <td className="px-5 py-3.5 text-center text-zinc-500">
                        {contact._count?.projects > 0 ? (
                          <span className="font-medium text-zinc-900">{contact._count.projects}</span>
                        ) : (
                          <span className="text-zinc-300">0</span>
                        )}
                      </td>
                    )}
                    <td className="px-5 py-3.5 text-xs text-zinc-400">{relativeDate(contact.createdAt)}</td>
                    {tab === "all" && (
                      <td className="px-5 py-3.5">
                        <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-semibold", sc.color)}>
                          {sc.label}
                        </span>
                      </td>
                    )}
                    <td className="px-5 py-3.5 text-right">
                      <Link
                        href={`/contacts/${contact.id}`}
                        className="rounded border border-zinc-200 px-2.5 py-1 text-xs font-medium text-zinc-600 hover:bg-zinc-50"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
