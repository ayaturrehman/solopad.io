import Image from "next/image";
import { cn } from "@/lib/utils";

export function BrandMark({ className, dark = false }) {
  return (
    <Image
      src={dark ? "/logo-icon-white.webp" : "/logo-icon.webp"}
      alt="SoloPad"
      width={32}
      height={32}
      className={cn("object-contain", className)}
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
      <Image
        src={src}
        alt="SoloPad."
        width={144}
        height={36}
        className={cn(lockupHeight, "w-auto object-contain")}
        draggable={false}
      />
    </div>
  );
}
