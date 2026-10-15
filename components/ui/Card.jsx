import { cn } from "@/lib/utils";

export function Card({ children, className, interactive = false, ...props }) {
  return (
    <div
      className={cn(
        "surface-card rounded bg-white",
        interactive && "transition-shadow duration-200 hover:shadow-md cursor-pointer",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className }) {
  return (
    <div className={cn("px-6 pb-2 pt-5", className)}>
      {children}
    </div>
  );
}

export function CardBody({ children, className }) {
  return <div className={cn("px-6 py-5", className)}>{children}</div>;
}
