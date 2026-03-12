import { FullScreenLoadingOverlay } from "@/components/shared/NavigationLoadingOverlay";

export default function Loading() {
  return (
    <div className="relative min-h-[60vh]">
      <FullScreenLoadingOverlay label="Loading" />
    </div>
  );
}
