"use client";

import { useEffect, useState } from "react";
import { Search, Plus, Bell, Settings, LogOut, ChevronDown, MoonStar, Sun } from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { signOut } from "next-auth/react";
import { useSession } from "next-auth/react";

const PAGE_ACTIONS = {
  "/dashboard":  null,
  "/projects":   null,
  "/contacts":   null,
  "/invoices":   null,
  "/pipeline":   null,
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
  const { data: session } = useSession();
  const pathname = usePathname();
  const [unread, setUnread] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [showBell, setShowBell] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [theme, setTheme] = useState(() => {
    if (typeof document === "undefined") return "light";
    return document.documentElement.getAttribute("data-theme") || "light";
  });

  // Match the current base path
  const matchedKey = Object.keys(PAGE_ACTIONS).find((key) =>
    pathname === key || (key !== "/dashboard" && pathname.startsWith(key))
  );
  const action = matchedKey ? PAGE_ACTIONS[matchedKey] : null;

  useEffect(() => {
    fetch("/api/notifications")
      .then((r) => r.json())
      .then((d) => {
        if (d.unreadCount != null) setUnread(d.unreadCount);
        if (d.notifications) setNotifications(d.notifications);
      })
      .catch(() => {});
  }, [pathname]);

  function handleSearch(e) {
    if (e.key === "Enter" && e.target.value.trim()) {
      // Future: global search
    }
  }

  async function markAllRead() {
    await fetch("/api/notifications", { method: "PATCH" });
    setUnread(0);
    setNotifications((n) => n.map((x) => ({ ...x, read: true })));
  }

  function setAppTheme(nextTheme) {
    document.documentElement.setAttribute("data-theme", nextTheme);
    localStorage.setItem("portalkit-theme", nextTheme);
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
      <div className="relative w-64">
        <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400" />
        <input
          type="text"
          placeholder="Search…"
          onKeyDown={handleSearch}
          className="w-full rounded-lg border border-zinc-200 bg-zinc-50 py-1.5 pl-8 pr-3 text-sm text-zinc-700 placeholder-zinc-400 outline-none focus:border-zinc-400 focus:bg-white"
        />
      </div>

      <div className="flex items-center gap-2">
        {action && (
          <Link
            href={action.href}
            className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-zinc-700"
          >
            <Plus className="h-3.5 w-3.5" />
            {action.label}
          </Link>
        )}

        <div className="relative">
          <button
            onClick={() => setShowBell((v) => !v)}
            className="relative inline-flex h-11 w-11 items-center justify-center rounded-xl text-zinc-500 transition-colors hover:bg-zinc-50 hover:text-zinc-900"
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
              <div className="absolute right-0 top-11 z-40 w-80 rounded-xl border border-zinc-200 bg-white shadow-lg">
                <div className="flex items-center justify-between border-b border-zinc-100 px-4 py-2.5">
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
                      <div
                        key={n.id}
                        className={cn("border-b border-zinc-50 px-4 py-2.5 last:border-0", !n.read && "bg-blue-50")}
                      >
                        <p className="text-xs font-medium text-zinc-800">{n.title}</p>
                        <p className="mt-0.5 text-[11px] text-zinc-500">{n.body}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        <div className="relative">
          <button
            onClick={() => setShowProfile((value) => !value)}
            className="inline-flex items-center gap-2 rounded-xl bg-white px-2.5 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 hover:text-zinc-900"
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
              <div className="absolute right-0 top-12 z-40 w-60 overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-lg">
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
                        "inline-flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium transition-colors",
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
                        "inline-flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium transition-colors",
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
                  <Link
                    href="/settings"
                    onClick={() => setShowProfile(false)}
                    className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-zinc-600 transition-colors hover:bg-zinc-50 hover:text-zinc-900"
                  >
                    <Settings className="h-4 w-4" />
                    Settings
                  </Link>
                  <button
                    onClick={() => signOut({ callbackUrl: "/login" })}
                    className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-zinc-600 transition-colors hover:bg-zinc-50 hover:text-zinc-900"
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
