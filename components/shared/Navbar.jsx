"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard, Zap, Briefcase, Users,
  DollarSign, Package, CalendarDays, GitMerge,
  LayoutTemplate, CheckSquare, Clock, CalendarCheck,
  FileText, FileSignature, Menu, X, ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";

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
      { href: "/contacts",     label: "Contacts",     icon: Users },
      { href: "/proposals",    label: "Proposals",    icon: FileText },
      { href: "/projects",     label: "Projects",     icon: Briefcase },
      { href: "/contracts",    label: "Contracts",    icon: FileSignature },
      { href: "/templates",    label: "Templates",    icon: LayoutTemplate },
    ],
  },
  {
    label: "Finance",
    items: [
      { href: "/finance",      label: "Finance",      icon: DollarSign },
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

// Flattened list for bottom nav (most used items)
const bottomNavItems = [
  { href: "/dashboard",  label: "Home",      icon: LayoutDashboard },
  { href: "/projects",   label: "Projects",  icon: Briefcase },
  { href: "/proposals",  label: "Proposals", icon: FileText },
  { href: "/tasks",      label: "Tasks",     icon: CheckSquare },
  { href: "/contacts",   label: "Contacts",  icon: Users },
];

export default function Navbar() {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);

  function isActive(href) {
    return pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
  }

  return (
    <>
      {/* ── Desktop sidebar (hidden on mobile) ── */}
      <aside className="hidden md:flex relative h-screen w-52 flex-col border-r border-[#2b3444] bg-[#17202d] px-2 py-4 text-white">
        {/* Logo */}
        <Link href="/dashboard" className="mb-5 flex items-center gap-2 px-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-white/10">
            <Zap className="h-3.5 w-3.5 text-white" />
          </div>
          <span className="text-base font-semibold tracking-tight text-white">PortalKit</span>
        </Link>

        {/* Nav groups */}
        <nav className="flex flex-1 flex-col gap-3 overflow-y-auto">
          {navGroups.map((group, gi) => (
            <div key={group.label}>
              {gi > 0 && <div className="mb-2 mt-1 border-t border-white/10" />}
              <p className="mb-1 px-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                {group.label}
              </p>
              <div className="flex flex-col gap-px">
                {group.items.map(({ href, label, icon: Icon }) => (
                  <Link
                    key={href}
                    href={href}
                    className={cn(
                      "flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium transition-colors",
                      isActive(href)
                        ? "bg-[#243247] text-[#dbeafe] shadow-sm"
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

        <div className="mt-2 border-t border-white/10 pt-2" />
      </aside>

      {/* ── Mobile bottom nav ── */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-zinc-200 bg-white">
        <div className="flex items-center justify-around px-1 py-1">
          {bottomNavItems.map(({ href, label, icon: Icon }) => {
            const active = isActive(href);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex flex-col items-center gap-0.5 px-2 py-2 rounded-xl min-w-0 flex-1 transition-colors",
                  active ? "text-[#17202d]" : "text-zinc-400"
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
            className="flex flex-col items-center gap-0.5 px-2 py-2 rounded-xl flex-1 text-zinc-400"
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
          />
          {/* Drawer slides up from bottom */}
          <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 rounded-t-2xl bg-[#17202d] text-white max-h-[80vh] flex flex-col">
            {/* Handle + header */}
            <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-md bg-white/10">
                  <Zap className="h-3 w-3 text-white" />
                </div>
                <span className="text-sm font-semibold text-white">PortalKit</span>
              </div>
              <button
                onClick={() => setDrawerOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10"
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
                    {group.items.map(({ href, label, icon: Icon }) => {
                      const active = isActive(href);
                      return (
                        <Link
                          key={href}
                          href={href}
                          onClick={() => setDrawerOpen(false)}
                          className={cn(
                            "flex items-center justify-between rounded-xl px-3 py-3 text-sm font-medium transition-colors",
                            active
                              ? "bg-[#243247] text-[#dbeafe]"
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

            {/* Safe area spacer */}
            <div className="h-6" />
          </div>
        </>
      )}
    </>
  );
}
