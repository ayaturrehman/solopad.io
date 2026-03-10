"use client";

import { Search, Plus } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";

const PAGE_ACTIONS = {
  "/dashboard":  null,
  "/projects":   { label: "New project",  href: "/projects/new" },
  "/contacts":   { label: "Add contact",  href: "/contacts/new" },
  "/invoices":   { label: "New invoice",  href: "/invoices/new" },
  "/pipeline":   { label: "New project",  href: "/projects/new" },
  "/finance":    null,
  "/services":   null,
  "/calendar":   null,
  "/settings":   null,
  "/templates":  null,
  "/tasks":        null,
  "/time-tracker": null,
  "/scheduler":    null,
};

export default function TopBar() {
  const pathname = usePathname();
  const router = useRouter();

  // Match the current base path
  const matchedKey = Object.keys(PAGE_ACTIONS).find((key) =>
    pathname === key || (key !== "/dashboard" && pathname.startsWith(key))
  );
  const action = matchedKey ? PAGE_ACTIONS[matchedKey] : null;

  function handleSearch(e) {
    if (e.key === "Enter" && e.target.value.trim()) {
      // Future: global search
    }
  }

  return (
    <div className="flex h-12 shrink-0 items-center justify-between border-b border-zinc-100 bg-white px-6">
      <div className="relative w-64">
        <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400" />
        <input
          type="text"
          placeholder="Search…"
          onKeyDown={handleSearch}
          className="w-full rounded-lg border border-zinc-200 bg-zinc-50 py-1.5 pl-8 pr-3 text-sm text-zinc-700 placeholder-zinc-400 outline-none focus:border-zinc-400 focus:bg-white"
        />
      </div>

      {action && (
        <Link
          href={action.href}
          className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-zinc-700"
        >
          <Plus className="h-3.5 w-3.5" />
          {action.label}
        </Link>
      )}
    </div>
  );
}
