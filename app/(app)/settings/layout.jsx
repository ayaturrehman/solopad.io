"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  User,
  Users,
  CreditCard,
  Bell,
  Receipt,
  LayoutTemplate,
} from "lucide-react";

const settingsNav = [
  { href: "/settings/profile", label: "Profile", icon: User, description: "Account & business details" },
  { href: "/settings/team", label: "Team", icon: Users, description: "Roles & team access" },
  { href: "/settings/payments", label: "Payments", icon: CreditCard, description: "Stripe & payment methods" },
  { href: "/settings/notifications", label: "Notifications", icon: Bell, description: "Reminders & alerts" },
  { href: "/settings/billing", label: "Billing", icon: Receipt, description: "Plan & subscription" },
  { href: "/settings/pdf-templates", label: "PDF Templates", icon: LayoutTemplate, description: "Invoice & proposal templates" },
];

export default function SettingsLayout({ children }) {
  const pathname = usePathname();

  function isActive(href) {
    return pathname === href || pathname.startsWith(href + "/");
  }

  return (
    <div className="px-4 py-4 md:px-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">Settings</h1>
        <p className="mt-1 text-sm text-zinc-500">Manage your account, team, payments, and preferences.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)]">
        {/* Sidebar navigation */}
        <nav className="space-y-1">
          {settingsNav.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive(href)
                  ? "bg-zinc-900 text-white"
                  : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          ))}
        </nav>

        {/* Page content */}
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
