export default function Loading() {
  return (
    <div className="min-h-screen animate-pulse space-y-6 ">
      {/* Page title skeleton */}
      <div className="h-7 w-48 rounded bg-zinc-200" />

      

      {/* Table skeleton */}
      <div className="rounded border border-zinc-200 bg-white">
        <div className="border-b border-zinc-100 px-5 py-4">
          <div className="h-5 w-36 rounded bg-zinc-200" />
        </div>
        <div className="divide-y divide-zinc-100">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-5 py-4">
              <div className="h-8 w-8 rounded-full bg-zinc-200 shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-48 rounded bg-zinc-200" />
                <div className="h-3 w-32 rounded bg-zinc-100" />
              </div>
              <div className="h-5 w-16 rounded bg-zinc-200" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
