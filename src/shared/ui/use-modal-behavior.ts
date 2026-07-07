"use client";

import { useEffect, useId, useRef } from "react";

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
  const modalId = useId();
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  // Scroll lock. The global scrollbar-gutter keeps the viewport stable, so
  // fixed controls do not jump when the modal opens.
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
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
    const modalStateKey = "__bangumiExplorerModalId";
    let closedByPop = false;
    let active = true;
    let pushed = false;

    // React Strict Mode intentionally runs effect setup/cleanup twice in dev.
    // Deferring the history write lets that probe cleanup cancel cleanly instead
    // of calling history.back(), which can immediately close the real modal.
    const pushTimer = window.setTimeout(() => {
      if (!active) return;
      window.history.pushState({ ...window.history.state, [modalStateKey]: modalId }, "");
      pushed = true;
    }, 0);

    const onPopState = () => {
      closedByPop = true;
      onCloseRef.current();
    };
    window.addEventListener("popstate", onPopState);

    return () => {
      active = false;
      window.clearTimeout(pushTimer);
      window.removeEventListener("popstate", onPopState);
      if (!closedByPop && pushed && window.history.state?.[modalStateKey] === modalId) {
        window.history.back();
      }
    };
  }, [modalId]);
}
