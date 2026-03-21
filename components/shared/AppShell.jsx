"use client";

import { Suspense } from "react";
import { usePathname } from "next/navigation";
import Navbar from "@/components/shared/Navbar";
import NavigationLoadingOverlay from "@/components/shared/NavigationLoadingOverlay";
import TopBar from "@/components/shared/TopBar";
import { ToastProvider } from "@/components/ui/Toast";

export default function AppShell({ children }) {
  const pathname = usePathname();
  const isBuilder = pathname?.startsWith("/templates/builder");

  if (isBuilder) {
    return <>{children}</>;
  }

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
            <div className="w-full pb-24 md:pb-6">{children}</div>
            <NavigationLoadingOverlay />
          </main>
        </div>
      </div>
    </ToastProvider>
  );
}
