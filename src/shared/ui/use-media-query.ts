"use client";

import { useSyncExternalStore } from "react";

/** Reactive media query. Returns false during SSR (mobile treatment applies after hydration). */
export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (notify) => {
      const list = window.matchMedia(query);
      list.addEventListener("change", notify);
      return () => list.removeEventListener("change", notify);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}

/** Tailwind's md breakpoint, as used for the desktop/mobile layout split. */
export const MOBILE_QUERY = "(max-width: 767px)";
