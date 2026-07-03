"use client";

import { useSyncExternalStore } from "react";

export type Theme = "light" | "dark";

const STORAGE_KEY = "ulap-theme";

// The source of truth is the `.dark` class on <html>, applied before
// hydration by the inline script in layout.tsx. This tiny store lets React
// subscribe to it without hydration mismatches.
let listeners: (() => void)[] = [];

function subscribe(listener: () => void) {
  listeners.push(listener);
  return () => {
    listeners = listeners.filter((l) => l !== listener);
  };
}

function getSnapshot(): Theme {
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

function getServerSnapshot(): Theme {
  return "light";
}

export function toggleTheme() {
  const next: Theme = getSnapshot() === "light" ? "dark" : "light";
  document.documentElement.classList.toggle("dark", next === "dark");
  try {
    localStorage.setItem(STORAGE_KEY, next);
  } catch {
    // storage unavailable (private mode) — theme still applies for the session
  }
  listeners.forEach((l) => l());
}

export function useTheme() {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return { theme, toggleTheme };
}
