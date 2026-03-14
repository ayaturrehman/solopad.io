import { cn } from "@/lib/utils";

export default function Input({ label, error, className, required = false, ...props }) {
  return (
    <div className="flex flex-col">
      {label && (
        <label className="mb-1 text-[12px] font-medium text-zinc-700">
          {label}
          {required ? <span className="ml-0.5 text-red-500">*</span> : null}
        </label>
      )}
      <input
        className={cn(
          "h-8 rounded border border-transparent bg-white px-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 disabled:bg-zinc-50 disabled:text-zinc-500",
          error && "border-red-400 focus:border-red-400 focus:ring-red-400",
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
