"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useSession } from "next-auth/react";
import BrandLogo from "@/components/shared/BrandLogo";
import {
  LayoutDashboard, Briefcase, Users,
  DollarSign, Package, CalendarDays,
  CheckSquare, Clock, CalendarCheck,
  FileText, FileSignature, Menu, X, ChevronRight,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { checkPermission } from "@/lib/permissions";

// permission: null means always visible
const navGroups = [
  {
    label: "Overview",
    items: [
      { href: "/dashboard",    label: "Dashboard",    icon: LayoutDashboard, permission: null },
      { href: "/calendar",     label: "Calendar",     icon: CalendarDays,    permission: null },
    ],
  },
  {
    label: "Work",
    items: [
      { href: "/contacts",     label: "Contacts",     icon: Users,          permission: "view_contacts" },
      { href: "/proposals",    label: "Proposals",    icon: FileText,       permission: "view_proposals" },
      { href: "/projects",     label: "Projects",     icon: Briefcase,      permission: "view_projects" },
      { href: "/contracts",    label: "Contracts",    icon: FileSignature,  permission: "view_contracts" },
    ],
  },
  {
    label: "Finance",
    items: [
      { href: "/finance",      label: "Finance",      icon: DollarSign,     permission: "view_finances" },
      { href: "/services",     label: "Services",     icon: Package,        permission: "view_projects" },
    ],
  },
  {
    label: "Tools",
    items: [
      { href: "/tasks",        label: "Tasks",        icon: CheckSquare,    permission: "view_tasks" },
      { href: "/time-tracker", label: "Time Tracker", icon: Clock,          permission: "view_time" },
      { href: "/scheduler",    label: "Scheduler",    icon: CalendarCheck,  permission: null },
    ],
  },
];

// Flattened list for bottom nav (most used items)
const bottomNavItems = [
  { href: "/dashboard",  label: "Home",      icon: LayoutDashboard, permission: null },
  { href: "/projects",   label: "Projects",  icon: Briefcase,       permission: "view_projects" },
  { href: "/proposals",  label: "Proposals", icon: FileText,        permission: "view_proposals" },
  { href: "/tasks",      label: "Tasks",     icon: CheckSquare,     permission: "view_tasks" },
  { href: "/contacts",   label: "Contacts",  icon: Users,           permission: "view_contacts" },
];

export default function Navbar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [drawerOpen, setDrawerOpen] = useState(false);

  function isActive(href) {
    return pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
  }

  return (
    <>
      {/* ── Desktop sidebar (hidden on mobile) ── */}
      <aside className="hidden md:flex relative h-screen w-52 flex-col border-r border-zinc-800 bg-zinc-900 text-white" role="navigation" aria-label="Main navigation">
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center bg-black/40 px-3 py-2">
          <BrandLogo dark markClassName="h-5 w-5" textClassName="text-sm text-white/90" />
        </Link>

        {/* Nav groups */}
        <nav className="flex flex-1 flex-col gap-3 overflow-y-auto mt-3 px-2">
          {navGroups.map((group, gi) => (
            <div key={group.label}>
              {gi > 0 && <div className="mb-2 mt-1 border-t border-white/10" />}
              <p className="mb-1 px-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                {group.label}
              </p>
              <div className="flex flex-col gap-px">
                {group.items
                  .filter(({ permission }) => !permission || checkPermission(session, permission))
                  .map(({ href, label, icon: Icon }) => (
                  <Link
                    key={href}
                    href={href}
                    aria-current={isActive(href) ? "page" : undefined}
                    className={cn(
                      "flex items-center gap-2.5 rounded px-3 py-1.5 text-[13px] font-medium transition-colors",
                      isActive(href)
                        ? "bg-zinc-700 text-blue-100 shadow-sm"
                        : "text-slate-300 hover:bg-white/8 hover:text-white"
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    {label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Settings footer */}
        <div className="border-t border-white/10 px-2 py-2">
          <Link
            href="/settings/profile"
            aria-current={isActive("/settings") ? "page" : undefined}
            className={cn(
              "flex items-center gap-2.5 rounded px-3 py-1.5 text-[13px] font-medium transition-colors",
              isActive("/settings")
                ? "bg-zinc-700 text-blue-100 shadow-sm"
                : "text-slate-300 hover:bg-white/8 hover:text-white"
            )}
          >
            <Settings className="h-4 w-4 shrink-0" />
            Settings
          </Link>
        </div>
      </aside>

      {/* ── Mobile bottom nav ── */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-zinc-200 bg-white" role="navigation" aria-label="Quick navigation">
        <div className="flex items-center justify-around px-1 py-1">
          {bottomNavItems
            .filter(({ permission }) => !permission || checkPermission(session, permission))
            .map(({ href, label, icon: Icon }) => {
            const active = isActive(href);
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex flex-col items-center gap-0.5 px-2 py-2 rounded min-w-0 flex-1 transition-colors",
                  active ? "text-zinc-900" : "text-zinc-400"
                )}
              >
                <Icon className={cn("h-5 w-5 shrink-0", active && "stroke-[2.2px]")} />
                <span className={cn("text-[10px] font-medium truncate", active ? "text-zinc-900" : "text-zinc-400")}>
                  {label}
                </span>
              </Link>
            );
          })}
          {/* More button opens full drawer */}
          <button
            onClick={() => setDrawerOpen(true)}
            aria-label="More navigation options"
            className="flex flex-col items-center gap-0.5 px-2 py-2 rounded flex-1 text-zinc-400"
          >
            <Menu className="h-5 w-5" />
            <span className="text-[10px] font-medium">More</span>
          </button>
        </div>
      </div>

      {/* ── Mobile full drawer ── */}
      {drawerOpen && (
        <>
          {/* Backdrop */}
          <div
            className="md:hidden fixed inset-0 z-50 bg-black/40"
            onClick={() => setDrawerOpen(false)}
            role="presentation"
          />
          {/* Drawer slides up from bottom */}
          <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 rounded-t-2xl bg-zinc-900 text-white max-h-[80vh] flex flex-col" role="dialog" aria-modal="true" aria-label="Navigation menu">
            {/* Handle + header */}
            <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-white/10">
            <div className="flex items-center gap-2">
                <BrandLogo dark markClassName="h-6 w-6" textClassName="text-sm text-white" />
              </div>
              <button
                onClick={() => setDrawerOpen(false)}
                aria-label="Close menu"
                className="rounded p-1.5 text-slate-400 hover:bg-white/10"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Scrollable nav groups */}
            <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
              {navGroups.map((group) => (
                <div key={group.label}>
                  <p className="mb-1.5 px-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                    {group.label}
                  </p>
                  <div className="flex flex-col gap-px">
                    {group.items
                      .filter(({ permission }) => !permission || checkPermission(session, permission))
                      .map(({ href, label, icon: Icon }) => {
                      const active = isActive(href);
                      return (
                        <Link
                          key={href}
                          href={href}
                          onClick={() => setDrawerOpen(false)}
                          aria-current={active ? "page" : undefined}
                          className={cn(
                            "flex items-center justify-between rounded px-3 py-3 text-sm font-medium transition-colors",
                            active
                              ? "bg-zinc-700 text-blue-100"
                              : "text-slate-300 hover:bg-white/8 hover:text-white"
                          )}
                        >
                          <span className="flex items-center gap-3">
                            <Icon className="h-4 w-4 shrink-0" />
                            {label}
                          </span>
                          {active && <ChevronRight className="h-3.5 w-3.5 text-slate-400" />}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </nav>

            {/* Settings links */}
            <div className="border-t border-white/10 px-3 py-3 space-y-px">
              {[
                { href: "/settings/profile", label: "Settings", icon: Settings },
              ].map(({ href, label, icon: Icon }) => {
                const active = isActive("/settings");
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setDrawerOpen(false)}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex items-center justify-between rounded px-3 py-3 text-sm font-medium transition-colors",
                      active ? "bg-zinc-700 text-blue-100" : "text-slate-300 hover:bg-white/8 hover:text-white"
                    )}
                  >
                    <span className="flex items-center gap-3">
                      <Icon className="h-4 w-4 shrink-0" />
                      {label}
                    </span>
                    {active && <ChevronRight className="h-3.5 w-3.5 text-slate-400" />}
                  </Link>
                );
              })}
            </div>

            {/* Safe area spacer */}
            <div className="h-6" />
          </div>
        </>
      )}
    </>
  );
}
