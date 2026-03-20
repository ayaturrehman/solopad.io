export default function Loading() {
  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header with Month Navigation */}
      <div className="flex items-center justify-between">
        <div className="h-8 w-48 animate-pulse rounded-md bg-zinc-100" />
        <div className="flex gap-2">
          <div className="h-9 w-24 animate-pulse rounded-md bg-zinc-100" />
          <div className="h-9 w-24 animate-pulse rounded-md bg-zinc-100" />
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="rounded-lg bg-white p-6 shadow-sm">
        {/* Weekday Headers */}
        <div className="grid grid-cols-7 gap-2 mb-4">
          {[...Array(7)].map((_, i) => (
            <div
              key={i}
              className="h-6 animate-pulse rounded bg-zinc-100 text-center"
            />
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-2">
          {[...Array(42)].map((_, i) => (
            <div
              key={i}
              className="aspect-square animate-pulse rounded-lg bg-zinc-50"
            />
          ))}
        </div>
      </div>

      {/* Upcoming Events List */}
      <div className="rounded-lg bg-white p-6 shadow-sm">
        <div className="h-6 w-40 animate-pulse bg-zinc-100 rounded mb-4" />
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex gap-3 border-l-4 border-zinc-100 pl-3">
              <div className="h-12 w-12 animate-pulse rounded bg-zinc-100" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-2/3 animate-pulse rounded bg-zinc-100" />
                <div className="h-3 w-1/3 animate-pulse rounded bg-zinc-50" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
