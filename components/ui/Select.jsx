import { cn } from "@/lib/utils";

export default function Select({ label, error, className, children, required = false, ...props }) {
  return (
    <div className="flex flex-col">
      {label ? (
        <label className="mb-1 text-[12px] font-medium text-zinc-700">
          {label}
          {required ? <span className="ml-0.5 text-red-500">*</span> : null}
        </label>
      ) : null}
      <select
        className={cn(
          "h-8 rounded border border-zinc-200 bg-white px-3 text-sm text-zinc-900 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 disabled:bg-zinc-50 disabled:text-zinc-500",
          error && "border-red-400 focus:border-red-400 focus:ring-red-400",
          className
        )}
        {...props}
      >
        {children}
      </select>
      {error ? <p className="text-xs text-red-600">{error}</p> : null}
    </div>
  );
}
