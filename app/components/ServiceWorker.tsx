"use client";

import { useEffect } from "react";

/** Registers the offline service worker (production only — it fights HMR in dev). */
export default function ServiceWorker() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js").catch(() => {
      // registration failure is non-fatal; the app works without it
    });
  }, []);
  return null;
}
