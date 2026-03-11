import { cn } from "@/lib/utils";

export function Card({ children, className, ...props }) {
  return (
    <div
      className={cn("rounded border border-zinc-200 bg-white", className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className }) {
  return (
    <div className={cn("border-b border-zinc-100 px-6 py-4", className)}>
      {children}
    </div>
  );
}

export function CardBody({ children, className }) {
  return <div className={cn("px-6 py-5", className)}>{children}</div>;
}
