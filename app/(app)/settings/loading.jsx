export default function Loading() {
  return (
    <div className="flex-1 p-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-1">
          <div className="space-y-2">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="h-10 animate-pulse rounded-md bg-zinc-100"
              />
            ))}
          </div>
        </div>

        {/* Main Content - Settings Form */}
        <div className="lg:col-span-3 space-y-6">
          {/* Form Sections */}
          {[...Array(3)].map((_, section) => (
            <div key={section} className="rounded-lg bg-white p-6 shadow-sm space-y-4">
              <div className="h-6 w-40 animate-pulse rounded bg-zinc-100" />
              <div className="space-y-4">
                {[...Array(3)].map((_, field) => (
                  <div key={field} className="space-y-2">
                    <div className="h-4 w-24 animate-pulse rounded bg-zinc-100" />
                    <div className="h-10 animate-pulse rounded-md bg-zinc-50" />
                  </div>
                ))}
              </div>
              <div className="flex gap-2 pt-2">
                <div className="h-10 w-24 animate-pulse rounded-md bg-zinc-100" />
                <div className="h-10 w-24 animate-pulse rounded-md bg-zinc-100" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
