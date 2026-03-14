"use client";

import { useEffect, useSyncExternalStore, Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

const OVERLAY_EVENT = "solopad:navigation-loading";
const listeners = new Set();

const overlayStore = {
  visible: false,
  timeoutId: null,
  subscribe(listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  emit() {
    listeners.forEach((listener) => listener());
  },
  show() {
    this.visible = true;
    if (this.timeoutId) window.clearTimeout(this.timeoutId);
    this.timeoutId = window.setTimeout(() => {
      this.visible = false;
      this.timeoutId = null;
      this.emit();
    }, 12000);
    this.emit();
  },
  hide() {
    this.visible = false;
    if (this.timeoutId) {
      window.clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
    this.emit();
  },
  getSnapshot() {
    return this.visible;
  },
};

export function showNavigationLoading() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(OVERLAY_EVENT, { detail: { visible: true } }));
}

export function hideNavigationLoading() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(OVERLAY_EVENT, { detail: { visible: false } }));
}

export function LoadingDots({ className, dotClassName }) {
  return (
    <div className={cn("flex items-center gap-2", className)} aria-hidden="true">
      {[0, 1, 2].map((dot) => (
        <span
          key={dot}
          className={cn(
            "h-2 w-2 animate-[loading-bounce_0.8s_infinite] rounded-full bg-blue-600 dark:bg-blue-400",
            dotClassName
          )}
          style={{ animationDelay: `${dot * 0.12}s` }}
        />
      ))}
    </div>
  );
}

export function FullScreenLoadingOverlay({ visible = true, label = "Loading" }) {
  return (
    <div
      className={cn(
        "absolute inset-0 z-[120] flex items-start justify-center pt-12 transition-opacity duration-150 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-[2px]",
        visible ? "opacity-100" : "pointer-events-none opacity-0"
      )}
      aria-hidden={!visible}
    >
      <div className="flex flex-col items-center gap-2">
        <LoadingDots />
        <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">{label}</p>
      </div>
    </div>
  );
}

function NavigationLoadingOverlayInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const routeKey = `${pathname}?${searchParams.toString()}`;
  const visible = useSyncExternalStore(
    overlayStore.subscribe.bind(overlayStore),
    overlayStore.getSnapshot.bind(overlayStore),
    () => false
  );

  useEffect(() => {
    overlayStore.hide();
  }, [routeKey]);

  useEffect(() => {
    const handleOverlayEvent = (event) => {
      const nextVisible = Boolean(event.detail?.visible);
      if (nextVisible) overlayStore.show();
      else overlayStore.hide();
    };

    const handleDocumentClick = (event) => {
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      const target = event.target;
      if (!(target instanceof Element)) return;

      const link = target.closest("a[href]");
      if (!link) return;

      const href = link.getAttribute("href");
      const targetAttr = link.getAttribute("target");
      const download = link.hasAttribute("download");
      if (!href || href.startsWith("#") || targetAttr === "_blank" || download) return;

      const url = new URL(href, window.location.href);
      if (url.origin !== window.location.origin) return;

      const nextRouteKey = `${url.pathname}${url.search}`;
      const currentRouteKey = `${window.location.pathname}${window.location.search}`;
      if (nextRouteKey === currentRouteKey) return;

      overlayStore.show();
    };

    window.addEventListener(OVERLAY_EVENT, handleOverlayEvent);
    document.addEventListener("click", handleDocumentClick, true);

    return () => {
      window.removeEventListener(OVERLAY_EVENT, handleOverlayEvent);
      document.removeEventListener("click", handleDocumentClick, true);
    };
  }, []);

  return (
    <>
      <style jsx global>{`
        @keyframes loading-bounce {
          0%, 80%, 100% {
            transform: scale(0.7);
            opacity: 0.45;
          }
          40% {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>
      <FullScreenLoadingOverlay visible={visible} />
    </>
  );
}

export default function NavigationLoadingOverlay() {
  return (
    <Suspense fallback={null}>
      <NavigationLoadingOverlayInner />
    </Suspense>
  );
}
