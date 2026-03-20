export default function Loading() {
  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="h-8 w-48 animate-pulse rounded-md bg-zinc-100" />
        <div className="h-9 w-32 animate-pulse rounded-md bg-zinc-100" />
      </div>

      {/* Filters/Controls */}
      <div className="flex gap-2">
        <div className="h-10 w-32 animate-pulse rounded-md bg-zinc-100" />
        <div className="h-10 w-32 animate-pulse rounded-md bg-zinc-100" />
      </div>

      {/* Table */}
      <div className="rounded-lg bg-white shadow-sm overflow-hidden">
        {/* Table Header */}
        <div className="grid grid-cols-5 gap-4 border-b border-zinc-200 bg-zinc-50 p-4">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="h-4 w-24 animate-pulse rounded bg-zinc-100"
            />
          ))}
        </div>

        {/* Table Rows */}
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="grid grid-cols-5 gap-4 border-b border-zinc-100 p-4 animate-pulse"
          >
            <div className="h-4 w-32 bg-zinc-50 rounded" />
            <div className="h-4 w-24 bg-zinc-50 rounded" />
            <div className="h-4 w-28 bg-zinc-50 rounded" />
            <div className="h-4 w-20 bg-zinc-50 rounded" />
            <div className="h-4 w-16 bg-zinc-50 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
