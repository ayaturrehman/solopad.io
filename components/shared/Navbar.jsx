"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Settings, LogOut, Zap, Briefcase, Users,
  DollarSign, Package, CalendarDays, GitMerge, Bell, ReceiptText,
  LayoutTemplate, CheckSquare, Clock, CalendarCheck, FileText, FileSignature
} from "lucide-react";
import { cn } from "@/lib/utils";
import { signOut } from "next-auth/react";
import { useState, useEffect } from "react";

const navGroups = [
  {
    label: "Overview",
    items: [
      { href: "/dashboard",    label: "Dashboard",    icon: LayoutDashboard },
      { href: "/pipeline",     label: "Pipeline",     icon: GitMerge },
      { href: "/calendar",     label: "Calendar",     icon: CalendarDays },
    ],
  },
  {
    label: "Work",
    items: [
      { href: "/projects",     label: "Projects",     icon: Briefcase },
      { href: "/contacts",     label: "Contacts",     icon: Users },
      { href: "/proposals",    label: "Proposals",    icon: FileText },
      { href: "/contracts",    label: "Contracts",    icon: FileSignature },
      { href: "/templates",    label: "Templates",    icon: LayoutTemplate },
    ],
  },
  {
    label: "Finance",
    items: [
      { href: "/finance",      label: "Finance",      icon: DollarSign },
      { href: "/invoices",     label: "Invoices",     icon: ReceiptText },
      { href: "/services",     label: "Services",     icon: Package },
    ],
  },
  {
    label: "Tools",
    items: [
      { href: "/tasks",        label: "Tasks",        icon: CheckSquare },
      { href: "/time-tracker", label: "Time Tracker", icon: Clock },
      { href: "/scheduler",    label: "Scheduler",    icon: CalendarCheck },
    ],
  },
];

export default function Navbar() {
  const pathname = usePathname();
  const [unread, setUnread] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [showBell, setShowBell] = useState(false);

  useEffect(() => {
    fetch("/api/notifications")
      .then((r) => r.json())
      .then((d) => {
        if (d.unreadCount != null) setUnread(d.unreadCount);
        if (d.notifications) setNotifications(d.notifications);
      })
      .catch(() => {});
  }, [pathname]);

  async function markAllRead() {
    await fetch("/api/notifications", { method: "PATCH" });
    setUnread(0);
    setNotifications((n) => n.map((x) => ({ ...x, read: true })));
  }

  return (
    <aside className="relative flex h-screen w-48 flex-col border-r border-zinc-100 bg-white px-2 py-4">
      {/* Logo */}
      <Link href="/dashboard" className="mb-5 flex items-center gap-2 px-2">
        <div className="flex h-6 w-6 items-center justify-center rounded-md bg-zinc-900">
          <Zap className="h-3.5 w-3.5 text-white" />
        </div>
        <span className="text-sm font-semibold text-zinc-900">PortalKit</span>
      </Link>

      {/* Nav groups */}
      <nav className="flex flex-1 flex-col gap-3 overflow-y-auto">
        {navGroups.map((group, gi) => (
          <div key={group.label}>
            {gi > 0 && <div className="mb-2 mt-1 border-t border-zinc-100" />}
            <p className="mb-0.5 px-2 text-[9px] font-semibold uppercase tracking-widest text-zinc-400">
              {group.label}
            </p>
            <div className="flex flex-col gap-px">
              {group.items.map(({ href, label, icon: Icon }) => {
                const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
                return (
                  <Link
                    key={href}
                    href={href}
                    className={cn(
                      "flex items-center gap-2.5 rounded-md px-2 py-1.5 text-[13px] font-medium transition-colors",
                      active
                        ? "bg-zinc-100 text-zinc-900"
                        : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-800"
                    )}
                  >
                    <Icon className="h-3.5 w-3.5 shrink-0" />
                    {label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom */}
      <div className="mt-2 flex flex-col gap-px border-t border-zinc-100 pt-2">
        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowBell((v) => !v)}
            className="flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-[13px] font-medium text-zinc-500 hover:bg-zinc-50 hover:text-zinc-800"
          >
            <span className="relative shrink-0">
              <Bell className="h-3.5 w-3.5" />
              {unread > 0 && (
                <span className="absolute -right-1 -top-1 flex h-3 w-3 items-center justify-center rounded-full bg-red-500 text-[8px] font-bold text-white">
                  {unread > 9 ? "9+" : unread}
                </span>
              )}
            </span>
            Notifications
          </button>

          {showBell && (
            <>
              <div className="fixed inset-0 z-30" onClick={() => setShowBell(false)} />
              <div className="absolute bottom-8 left-0 z-40 w-72 rounded-xl border border-zinc-200 bg-white shadow-lg">
                <div className="flex items-center justify-between border-b border-zinc-100 px-4 py-2.5">
                  <span className="text-xs font-semibold text-zinc-900">Notifications</span>
                  {unread > 0 && (
                    <button onClick={markAllRead} className="text-[10px] text-zinc-400 hover:text-zinc-700">
                      Mark all read
                    </button>
                  )}
                </div>
                <div className="max-h-64 overflow-y-auto">
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

        <Link
          href="/settings"
          className={cn(
            "flex items-center gap-2.5 rounded-md px-2 py-1.5 text-[13px] font-medium transition-colors",
            pathname.startsWith("/settings") ? "bg-zinc-100 text-zinc-900" : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-800"
          )}
        >
          <Settings className="h-3.5 w-3.5 shrink-0" />
          Settings
        </Link>

        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex items-center gap-2.5 rounded-md px-2 py-1.5 text-[13px] font-medium text-zinc-500 hover:bg-zinc-50 hover:text-zinc-800"
        >
          <LogOut className="h-3.5 w-3.5 shrink-0" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
