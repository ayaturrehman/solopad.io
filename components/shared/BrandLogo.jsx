import { cn } from "@/lib/utils";

export function BrandMark({ className, dark = false }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={dark ? "/logo-icon-white.webp" : "/logo-icon.webp"}
      alt="SoloPad"
      className={cn("h-8 w-8 object-contain", className)}
      draggable={false}
    />
  );
}

// Map icon height classes to lockup height classes
// Lockup image aspect ratio is ~3.9:1, icon is ~85% of lockup height
const LOCKUP_HEIGHT_MAP = {
  "h-5": "h-6",
  "h-6": "h-7",
  "h-7": "h-8",
  "h-8": "h-9",
};

function extractHeightClass(classStr) {
  if (!classStr) return null;
  const match = classStr.match(/h-\[?\d+(?:px)?\]?/);
  return match ? match[0] : null;
}

export default function BrandLogo({
  className,
  markClassName,
  textClassName,
  dark = false,
}) {
  const markHeight = extractHeightClass(markClassName);
  const lockupHeight = markHeight
    ? LOCKUP_HEIGHT_MAP[markHeight] || markHeight
    : "h-8";

  const src = dark ? "/logo-white@2x.webp" : "/logo@2x.webp";
  const srcSet = dark
    ? "/logo-white.webp 1x, /logo-white@2x.webp 2x, /logo-white@3x.webp 3x"
    : "/logo.webp 1x, /logo@2x.webp 2x, /logo@3x.webp 3x";

  return (
    <div className={cn("flex items-center", className)}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        srcSet={srcSet}
        alt="SoloPad."
        className={cn(lockupHeight, "w-auto object-contain")}
        draggable={false}
      />
    </div>
  );
}
