"use client";

import { Suspense } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/shared/Navbar";
import NavigationLoadingOverlay from "@/components/shared/NavigationLoadingOverlay";
import TopBar from "@/components/shared/TopBar";
import { ToastProvider } from "@/components/ui/Toast";
import { AlertCircle } from "lucide-react";

export default function AppShell({ children, subscriptionExpired = false }) {
  const pathname = usePathname();
  const isBuilder = pathname?.startsWith("/templates/builder");

  if (isBuilder) {
    return <>{children}</>;
  }

  // Allow billing and pricing pages even when subscription expired
  const isBillingPage = pathname?.startsWith("/settings") || pathname?.startsWith("/pricing");

  return (
    <ToastProvider>
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:z-[100] focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-zinc-900 focus:shadow-md">
        Skip to main content
      </a>
      <div className="flex h-screen overflow-hidden bg-white">
        <Navbar />
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <Suspense fallback={null}><TopBar /></Suspense>
          <main id="main-content" className="relative flex-1 overflow-y-auto">
            {subscriptionExpired && !isBillingPage ? (
              <div className="flex flex-1 items-center justify-center p-8">
                <div className="mx-auto max-w-md text-center">
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-amber-100">
                    <AlertCircle className="h-7 w-7 text-amber-600" />
                  </div>
                  <h2 className="text-xl font-semibold text-zinc-900">Your trial has ended</h2>
                  <p className="mt-2 text-sm text-zinc-500">
                    Your free trial has expired. Subscribe to a plan to continue using SoloPad. Your data is safe and waiting for you.
                  </p>
                  <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
                    <Link
                      href="/pricing"
                      className="inline-flex items-center justify-center rounded-lg bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-zinc-700 transition"
                    >
                      View plans
                    </Link>
                    <Link
                      href="/settings/billing"
                      className="inline-flex items-center justify-center rounded-lg border border-zinc-200 bg-white px-5 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition"
                    >
                      Manage billing
                    </Link>
                  </div>
                </div>
              </div>
            ) : (
              <div className="w-full pb-24 md:pb-6">{children}</div>
            )}
            <NavigationLoadingOverlay />
          </main>
        </div>
      </div>
    </ToastProvider>
  );
}
