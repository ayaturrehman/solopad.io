"use client";

import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import {
  Search, Plus, Bell, Settings, LogOut, ChevronDown, MoonStar, Sun,
} from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { LoadingDots } from "@/components/shared/NavigationLoadingOverlay";
import { cn } from "@/lib/utils";
import { signOut, useSession } from "next-auth/react";

function timeAgo(dateStr) {
  const now = Date.now();
  const diff = now - new Date(dateStr).getTime();
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

const PAGE_ACTIONS = {
  "/dashboard": null,
  "/projects": null,
  "/contacts": null,
  "/invoices": null,
  "/pipeline": null,
  "/finance": null,
  "/services": null,
  "/calendar": null,
  "/settings": null,
  "/templates": null,
  "/tasks": null,
  "/time-tracker": null,
  "/scheduler": null,
  "/contracts": null,
  "/proposals": null,
};

const MODULE_SEARCH = {
  "/contracts": "Search contracts...",
  "/contacts": "Search contacts...",
  "/projects": "Search projects...",
  "/proposals": "Search proposals...",
  "/services": "Search services...",
  "/tasks": "Search tasks...",
};

export default function TopBar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [unread, setUnread] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [showBell, setShowBell] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [searchValue, setSearchValue] = useState(searchParams.get("q") || "");
  const [isSearchPending, startSearchTransition] = useTransition();
  const [theme, setTheme] = useState(() => {
    if (typeof document === "undefined") return "light";
    return document.documentElement.getAttribute("data-theme") || "light";
  });

  const matchedKey = Object.keys(PAGE_ACTIONS).find((key) =>
    pathname === key || (key !== "/dashboard" && pathname.startsWith(key))
  );
  const action = matchedKey ? PAGE_ACTIONS[matchedKey] : null;

  const searchModuleKey = useMemo(
    () => Object.keys(MODULE_SEARCH).find((key) => pathname === key || pathname.startsWith(`${key}/`)) || null,
    [pathname]
  );
  const financeTab = searchParams.get("tab");

  // Only show search on pages that actually implement it
  const showSearch = useMemo(() => {
    if (pathname === "/finance") return financeTab === "invoices" || financeTab === "expenses";
    return searchModuleKey !== null;
  }, [pathname, financeTab, searchModuleKey]);

  const searchPlaceholder = useMemo(() => {
    if (pathname === "/finance" && financeTab === "invoices") return "Search invoices...";
    if (pathname === "/finance" && financeTab === "expenses") return "Search expenses...";
    return searchModuleKey ? MODULE_SEARCH[searchModuleKey] : "Search...";
  }, [financeTab, pathname, searchModuleKey]);
  const searchParamsString = searchParams.toString();

  // Only sync URL → input when the user navigates (not while typing).
  // We detect navigation by checking if the pathname or non-q params changed.
  const nonQParams = useMemo(() => {
    const p = new URLSearchParams(searchParams.toString());
    p.delete("q");
    return p.toString();
  }, [searchParams]);

  useEffect(() => {
    setSearchValue(searchParams.get("q") || "");
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, nonQParams]);

  const fetchNotifications = useCallback((countOnly = false) => {
    const url = countOnly ? "/api/notifications?countOnly=1" : "/api/notifications";
    fetch(url)
      .then((r) => r.json())
      .then((d) => {
        if (d.unreadCount != null) setUnread(d.unreadCount);
        if (d.notifications) setNotifications(d.notifications);
      })
      .catch(() => {});
  }, []);

  // Full fetch on mount, lightweight count-only poll every 30s
  useEffect(() => {
    fetchNotifications(false);
    const interval = setInterval(() => fetchNotifications(true), 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  useEffect(() => {
    if (!searchModuleKey) return undefined;

    const timeout = setTimeout(() => {
      const trimmed = searchValue.trim();
      const liveParams = new URLSearchParams(searchParamsString);
      const currentQ = liveParams.get("q") || "";
      // Only push if the value actually changed to avoid re-triggering this effect
      if (trimmed === currentQ) return;

      const params = new URLSearchParams(searchParamsString);
      if (trimmed) params.set("q", trimmed);
      else params.delete("q");
      if (params.has("page")) params.set("page", "1");

      const next = params.toString();
      startSearchTransition(() => {
        router.replace(next ? `${pathname}?${next}` : pathname, { scroll: false });
      });
    }, 300);

    return () => clearTimeout(timeout);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, searchModuleKey, searchParamsString, searchValue]);

  async function markAllRead() {
    await fetch("/api/notifications", { method: "PATCH" });
    setUnread(0);
    setNotifications((n) => n.map((x) => ({ ...x, read: true })));
  }

  async function handleNotificationClick(n) {
    // Mark as read if unread
    if (!n.read) {
      fetch(`/api/notifications/${n.id}`, { method: "PATCH" }).catch(() => {});
      setNotifications((prev) => prev.map((x) => x.id === n.id ? { ...x, read: true } : x));
      setUnread((c) => Math.max(0, c - 1));
    }
    setShowBell(false);
    if (n.link) router.push(n.link);
  }

  function setAppTheme(nextTheme) {
    document.documentElement.setAttribute("data-theme", nextTheme);
    localStorage.setItem("solopad-theme", nextTheme);
    setTheme(nextTheme);
    setShowProfile(false);
  }

  const userName = session?.user?.name || "Account";
  const initials = userName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "A";

  return (
    <div className="flex h-12 shrink-0 items-center justify-between border-b border-zinc-100 bg-white px-6">
      <div className="flex items-center gap-3">
        <div className="relative w-64">
          {showSearch && (
            <>
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full rounded border border-zinc-200 bg-zinc-50 py-1.5 pl-8 pr-10 text-sm text-zinc-700 placeholder-zinc-400 outline-none focus:border-zinc-400 focus:bg-white"
              />
              {isSearchPending && (
                <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
                  <LoadingDots className="gap-1" dotClassName="h-1.5 w-1.5 bg-blue-500" />
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        {action && (
          <Link
            href={action.href}
            className="inline-flex items-center gap-1.5 rounded bg-zinc-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-zinc-700"
          >
            <Plus className="h-3.5 w-3.5" />
            {action.label}
          </Link>
        )}

        <div className="relative">
          <button
            onClick={() => {
              if (!showBell) {
                fetchNotifications();
                setShowProfile(false);
              }
              setShowBell((v) => !v);
            }}
            className="relative inline-flex h-11 w-11 items-center justify-center rounded text-zinc-500 transition-colors hover:bg-zinc-50 hover:text-zinc-900"
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4" />
            {unread > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-[9px] font-bold text-white shadow-sm">
                {unread > 9 ? "9+" : unread}
              </span>
            )}
          </button>

          {showBell && (
            <>
              <div className="fixed inset-0 z-30" onClick={() => setShowBell(false)} />
              <div className="absolute right-0 top-11 z-40 w-80 rounded border border-zinc-200 bg-white shadow-lg">
                <div className="flex items-center justify-between border-b border-zinc-100 px-3 py-2">
                  <span className="text-xs font-semibold text-zinc-900">Notifications</span>
                  {unread > 0 && (
                    <button onClick={markAllRead} className="text-[10px] text-zinc-400 hover:text-zinc-700">
                      Mark all read
                    </button>
                  )}
                </div>
                <div className="max-h-72 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <p className="px-4 py-5 text-center text-xs text-zinc-400">No notifications yet.</p>
                  ) : (
                    notifications.map((n) => (
                      <button
                        key={n.id}
                        onClick={() => handleNotificationClick(n)}
                        className={cn(
                          "w-full border-b border-zinc-50 px-3 py-2 text-left transition-colors last:border-0 hover:bg-zinc-50",
                          !n.read && "bg-blue-50 hover:bg-blue-100"
                        )}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-xs font-medium text-zinc-800">{n.title}</p>
                          <span className="shrink-0 text-[10px] text-zinc-400">{timeAgo(n.createdAt)}</span>
                        </div>
                        <p className="mt-0.5 text-[11px] text-zinc-500">{n.body}</p>
                      </button>
                    ))
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        <Link
          href="/settings"
          className="inline-flex h-11 w-11 items-center justify-center rounded text-zinc-500 transition-colors hover:bg-zinc-50 hover:text-zinc-900"
          aria-label="Settings"
        >
          <Settings className="h-4 w-4" />
        </Link>

        <div className="relative">
          <button
            onClick={() => { setShowBell(false); setShowProfile((value) => !value); }}
            className="inline-flex items-center gap-2 rounded bg-white px-2.5 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 hover:text-zinc-900"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-zinc-900 text-xs font-semibold text-white">
              {initials}
            </span>
            <span className="hidden sm:block">{userName}</span>
            <ChevronDown className="h-4 w-4 text-zinc-400" />
          </button>

          {showProfile && (
            <>
              <div className="fixed inset-0 z-30" onClick={() => setShowProfile(false)} />
              <div className="absolute right-0 top-12 z-40 w-60 overflow-hidden rounded border border-zinc-200 bg-white shadow-lg">
                <div className="border-b border-zinc-100 px-4 py-3">
                  <p className="text-sm font-semibold text-zinc-900">{userName}</p>
                  <p className="text-xs text-zinc-500">{session?.user?.email || "Signed in"}</p>
                </div>

                <div className="border-b border-zinc-100 p-2">
                  <p className="px-2 pb-2 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">Appearance</p>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setAppTheme("light")}
                      className={cn(
                        "inline-flex items-center justify-center gap-2 rounded border px-3 py-1.5 text-xs font-medium transition-colors",
                        theme === "light"
                          ? "border-zinc-900 bg-zinc-900 text-white"
                          : "border-zinc-200 text-zinc-600 hover:bg-zinc-50"
                      )}
                    >
                      <Sun className="h-3.5 w-3.5" />
                      Light
                    </button>
                    <button
                      type="button"
                      onClick={() => setAppTheme("dark")}
                      className={cn(
                        "inline-flex items-center justify-center gap-2 rounded border px-3 py-1.5 text-xs font-medium transition-colors",
                        theme === "dark"
                          ? "border-zinc-900 bg-zinc-900 text-white"
                          : "border-zinc-200 text-zinc-600 hover:bg-zinc-50"
                      )}
                    >
                      <MoonStar className="h-3.5 w-3.5" />
                      Dark
                    </button>
                  </div>
                </div>

                <div className="p-2">
                  <button
                    onClick={() => signOut({ callbackUrl: "/login" })}
                    className="flex w-full items-center gap-2.5 rounded px-3 py-1.5 text-sm text-zinc-600 transition-colors hover:bg-zinc-50 hover:text-zinc-900"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign out
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
