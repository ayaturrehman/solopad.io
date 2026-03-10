"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Zap, Briefcase, Users,
  DollarSign, Package, CalendarDays, GitMerge,
  LayoutTemplate, CheckSquare, Clock, CalendarCheck, FileText, FileSignature
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

export default function Navbar() {
  const pathname = usePathname();

  return (
    <aside className="relative flex h-screen w-40 flex-col border-r border-zinc-100 bg-white px-1.5 py-4">
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
                      "flex items-center gap-2 rounded-md px-2 py-1.5 text-[13px] font-medium transition-colors",
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

      <div className="mt-2 border-t border-zinc-100 pt-2" />
    </aside>
  );
}
