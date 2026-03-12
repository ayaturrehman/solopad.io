export default function Loading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="h-8 w-40 rounded bg-zinc-200" />
        <div className="flex gap-2">
          <div className="h-8 w-28 rounded bg-zinc-200" />
          <div className="h-8 w-28 rounded bg-zinc-200" />
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <div className="h-20 rounded border border-zinc-200 bg-white" />
        <div className="h-20 rounded border border-zinc-200 bg-white" />
        <div className="h-20 rounded border border-zinc-200 bg-white" />
      </div>

      <div className="overflow-hidden rounded border border-zinc-200 bg-white">
        <div className="border-b border-zinc-100 bg-zinc-50 px-5 py-3">
          <div className="h-4 w-56 rounded bg-zinc-200" />
        </div>
        <div className="divide-y divide-zinc-100">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="flex items-center justify-between px-5 py-4">
              <div className="space-y-2">
                <div className="h-4 w-40 rounded bg-zinc-200" />
                <div className="h-3 w-56 rounded bg-zinc-100" />
              </div>
              <div className="h-7 w-16 rounded bg-zinc-200" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
