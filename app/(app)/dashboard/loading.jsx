export default function Loading() {
  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="h-8 w-48 animate-pulse rounded-md bg-zinc-100" />
        <div className="h-9 w-32 animate-pulse rounded-md bg-zinc-100" />
      </div>

      {/* Stat Cards Row */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="space-y-2 rounded-lg bg-white p-6 shadow-sm animate-pulse"
          >
            <div className="h-4 w-24 bg-zinc-100 rounded" />
            <div className="h-6 w-32 bg-zinc-100 rounded" />
          </div>
        ))}
      </div>

      {/* Chart Area */}
      <div className="rounded-lg bg-white p-6 shadow-sm animate-pulse">
        <div className="h-6 w-40 bg-zinc-100 rounded mb-4" />
        <div className="h-64 bg-zinc-50 rounded" />
      </div>

      {/* Recent Items List */}
      <div className="rounded-lg bg-white p-6 shadow-sm">
        <div className="h-6 w-40 animate-pulse bg-zinc-100 rounded mb-4" />
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 animate-pulse rounded-lg bg-zinc-50" />
          ))}
        </div>
      </div>
    </div>
  );
}
