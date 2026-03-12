"use client";

import { useEffect, useSyncExternalStore } from "react";
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
          className={cn("h-2.5 w-2.5 animate-[loading-bounce_0.8s_infinite] rounded-full bg-blue-600", dotClassName)}
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
        "absolute inset-0 z-[120] flex justify-center bg-zinc-100/70 backdrop-blur-[2px] transition-opacity duration-150 mt-6",
        visible ? "opacity-100" : "pointer-events-none opacity-0"
      )}
      aria-hidden={!visible}
    >
      <div className="flex min-w-32 flex-col items-center gap-3 rounded bg-zinc-100/90 px-6 py-5">
        <LoadingDots />
        <p className="text-sm font-medium text-zinc-700">{label}</p>
      </div>
    </div>
  );
}

export default function NavigationLoadingOverlay() {
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

      const submitButton = target.closest('button[type="submit"], input[type="submit"]');
      if (submitButton && !submitButton.hasAttribute("disabled")) {
        overlayStore.show();
        return;
      }

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
      <div className="pointer-events-none absolute inset-0">
        <FullScreenLoadingOverlay visible={visible} />
      </div>
    </>
  );
}
