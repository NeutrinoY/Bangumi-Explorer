"use client";

import { useEffect, useRef } from "react";

/** Calls the handler when a pointer-down lands outside the returned element. */
export function useClickOutside<T extends HTMLElement>(
  enabled: boolean,
  onOutside: () => void,
): React.RefObject<T | null> {
  const ref = useRef<T>(null);
  const onOutsideRef = useRef(onOutside);
  onOutsideRef.current = onOutside;

  useEffect(() => {
    if (!enabled) return;

    const onPointerDown = (event: MouseEvent | TouchEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        onOutsideRef.current();
      }
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
    };
  }, [enabled]);

  return ref;
}
