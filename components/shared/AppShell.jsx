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
      <div className="flex h-screen overflow-hidden bg-white">
        <Navbar />
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <Suspense fallback={null}><TopBar /></Suspense>
          <main className="relative flex-1 overflow-y-auto">
            <div className="w-full pb-24 md:pb-6">{children}</div>
            <NavigationLoadingOverlay />
          </main>
        </div>
      </div>
    </ToastProvider>
  );
}
