import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import BrandLogo, { BrandMark } from "@/components/shared/BrandLogo";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col bg-zinc-50">
      {/* Top bar */}
      <header className="flex h-14 items-center border-b border-zinc-200 bg-white px-6">
        <Link href="/dashboard" className="flex items-center gap-2">
          <BrandLogo dark markClassName="h-7 w-7" textClassName="text-sm text-zinc-900" />
        </Link>
      </header>

      {/* Main */}
      <main className="flex flex-1 flex-col items-center justify-center px-6 py-20 text-center">
        {/* Large 404 */}
        <div className="relative mb-8 select-none">
          <p className="text-[120px] font-bold leading-none tracking-tighter text-zinc-100 sm:text-[180px]">
            404
          </p>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex flex-col items-center gap-2">
              <div className="flex h-14 w-14 items-center justify-center rounded-full border border-zinc-200 bg-white shadow-sm">
                <BrandMark dark className="h-8 w-8" />
              </div>
            </div>
          </div>
        </div>

        {/* Text */}
        <h1 className="mb-2 text-xl font-semibold text-zinc-900">
          Page not found
        </h1>
        <p className="mb-8 max-w-sm text-sm text-zinc-500">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
          Here are some helpful links to get you back on track.
        </p>

        {/* Actions */}
        <div className="flex flex-wrap justify-center gap-3">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Go to dashboard
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 rounded border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
          >
            Back to login
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-200 py-4 text-center">
        <p className="text-xs text-zinc-400">
          &copy; {new Date().getFullYear()} Solopad. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
