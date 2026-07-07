"use client";

import { useEffect, useRef } from "react";

/**
 * Shared modal behavior:
 * - body scroll lock without layout shift (scrollbar width compensation);
 * - Escape closes;
 * - one history entry so the system back button/gesture closes the modal
 *   instead of leaving the site (essential on mobile).
 *
 * Rendering is left to the caller; this hook only wires the behavior.
 */
export function useModalBehavior(onClose: () => void): void {
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  // Scroll lock. overflow:hidden removes the scrollbar, which would shift
  // the page; pad the body by the scrollbar's width while locked.
  useEffect(() => {
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    const previousOverflow = document.body.style.overflow;
    const previousPadding = document.body.style.paddingRight;
    document.body.style.overflow = "hidden";
    if (scrollbarWidth > 0) document.body.style.paddingRight = `${scrollbarWidth}px`;
    return () => {
      document.body.style.overflow = previousOverflow;
      document.body.style.paddingRight = previousPadding;
    };
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onCloseRef.current();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  // Back-button close: push a state on open; popstate = user pressed back →
  // close the modal. If the modal closes by other means (X, Escape, backdrop),
  // consume our extra entry so history stays balanced.
  useEffect(() => {
    let closedByPop = false;
    window.history.pushState({ modal: true }, "");

    const onPopState = () => {
      closedByPop = true;
      onCloseRef.current();
    };
    window.addEventListener("popstate", onPopState);

    return () => {
      window.removeEventListener("popstate", onPopState);
      if (!closedByPop) window.history.back();
    };
  }, []);
}
