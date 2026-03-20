export default function Loading() {
  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="h-8 w-48 animate-pulse rounded-md bg-zinc-100" />
        <div className="h-9 w-32 animate-pulse rounded-md bg-zinc-100" />
      </div>

      {/* Filter/Search */}
      <div className="flex gap-2">
        <div className="h-10 w-64 animate-pulse rounded-md bg-zinc-100" />
        <div className="h-10 w-32 animate-pulse rounded-md bg-zinc-100" />
      </div>

      {/* Service Cards Grid - 2x2 */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="rounded-lg bg-white p-6 shadow-sm animate-pulse space-y-4"
          >
            <div className="h-6 w-40 bg-zinc-100 rounded" />
            <div className="space-y-2">
              <div className="h-4 w-full bg-zinc-50 rounded" />
              <div className="h-4 w-3/4 bg-zinc-50 rounded" />
              <div className="h-4 w-1/2 bg-zinc-50 rounded" />
            </div>
            <div className="flex justify-between pt-2">
              <div className="h-8 w-20 bg-zinc-100 rounded" />
              <div className="h-8 w-20 bg-zinc-100 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
