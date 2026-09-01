"use client";

import { useEffect } from "react";

/**
 * Registers the hand-rolled service worker (public/sw.js) for offline/PWA
 * support. No next-pwa or Workbox — kept small and dependency-free to avoid
 * Turbopack build-plugin compatibility risk. Silently no-ops if unsupported
 * (older browsers, some in-app webviews) — this is a progressive enhancement,
 * never something the rest of the app depends on.
 */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;
    if (process.env.NODE_ENV !== "production") return; // avoid caching dev's fast-refreshing assets
    navigator.serviceWorker.register("/sw.js").catch(() => {});
  }, []);

  return null;
}
