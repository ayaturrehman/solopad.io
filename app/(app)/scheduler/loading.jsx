export default function Loading() {
  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="h-8 w-48 animate-pulse rounded-md bg-zinc-100" />
        <div className="h-9 w-32 animate-pulse rounded-md bg-zinc-100" />
      </div>

      {/* Date/Time Navigation */}
      <div className="flex gap-2 items-center">
        <div className="h-10 w-24 animate-pulse rounded-md bg-zinc-100" />
        <div className="h-10 w-40 animate-pulse rounded-md bg-zinc-100" />
        <div className="h-10 w-24 animate-pulse rounded-md bg-zinc-100" />
      </div>

      {/* Time Slots List */}
      <div className="space-y-3">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 rounded-lg bg-white p-4 shadow-sm animate-pulse"
          >
            <div className="h-8 w-20 bg-zinc-100 rounded" />
            <div className="flex-1">
              <div className="h-4 w-2/3 bg-zinc-100 rounded mb-2" />
              <div className="h-3 w-1/2 bg-zinc-50 rounded" />
            </div>
            <div className="h-6 w-24 bg-zinc-100 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
