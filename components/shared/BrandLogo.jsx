import { cn } from "@/lib/utils";

const BRAND_NAVY = "#155DFC";

export function BrandMark({ className, dark = false }) {
  return (
    <svg
      viewBox="12 4 40 52"
      aria-hidden="true"
      className={cn("h-8 w-8", className)}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect x="14" y="10" width="36" height="44" rx="9" fill={dark ? "white" : BRAND_NAVY} />
      <rect x="22" y="6" width="20" height="6" rx="3" fill="#F05A37" />
      <rect x="20" y="20" width="24" height="3.25" rx="1.625" fill={dark ? "rgba(23,32,45,0.2)" : "rgba(255,255,255,0.78)"} />
      <rect x="20" y="29" width="24" height="3.25" rx="1.625" fill={dark ? "rgba(23,32,45,0.2)" : "rgba(255,255,255,0.78)"} />
      <rect x="20" y="38" width="15" height="3.25" rx="1.625" fill="#F05A37" />
    </svg>
  );
}

export default function BrandLogo({ 
  className,
  markClassName,
  textClassName,
  dark = false,
  label = "SoloPad",
}) {
  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <BrandMark className={markClassName} dark={dark} />
      <span className={cn("font-semibold tracking-tight", textClassName)}>{label}</span>
    </div>
  );
}
