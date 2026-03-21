"use client";

export default function Error({ error, reset }) {
  console.error(error);

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 py-32">
      <div className="rounded-lg border border-zinc-200 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h2 className="text-lg font-semibold text-zinc-900">Something went wrong</h2>
        <p className="mt-1 text-sm text-zinc-500">An unexpected error occurred. Please try again.</p>
        <button
          onClick={() => reset()}
          className="mt-4 inline-flex items-center rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
