import { cn } from "@/lib/utils";

const variants = {
  primary: "bg-zinc-900 text-white hover:bg-zinc-700 shadow-sm hover:shadow",
  secondary: "border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 hover:shadow-sm",
  danger: "bg-red-600 text-white hover:bg-red-700 shadow-sm hover:shadow",
  ghost: "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900",
};

const sizes = {
  sm: "h-8 px-3 text-sm",
  md: "h-9 px-4 text-sm",
  lg: "h-10 px-5 text-sm",
};

export default function Button({
  children,
  variant = "primary",
  size = "md",
  className,
  loading,
  ...props
}) {
  return (
    <button
      className={cn(
        "inline-flex items-center gap-1.5 rounded font-medium transition-all duration-150 hover:-translate-y-px active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed",
        variants[variant],
        sizes[size],
        className
      )}
      disabled={loading || props.disabled}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading && (
        <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {children}
    </button>
  );
}
