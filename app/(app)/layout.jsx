"use client";

import { Suspense } from "react";
import { usePathname } from "next/navigation";
import Navbar from "@/components/shared/Navbar";
import TopBar from "@/components/shared/TopBar";

export default function AppLayout({ children }) {
  const pathname = usePathname();
  const isBuilder = pathname?.startsWith("/templates/builder");

  if (isBuilder) {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-zinc-100">
      <Navbar />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Suspense fallback={null}><TopBar /></Suspense>
        <main className="flex-1 overflow-y-auto">
          <div className="w-full px-4 py-6 pb-24 md:pb-6 lg:px-5">{children}</div>
        </main>
      </div>
    </div>
  );
}
