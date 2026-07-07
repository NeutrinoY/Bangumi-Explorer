"use client";

/**
 * Runs a DOM update inside a View Transition when the browser supports it
 * (used for the card→detail poster morph); otherwise applies it directly.
 * Callers pair this with `view-transition-name` styles — without support the
 * styles are inert and the regular motion animations carry the experience.
 */
export function withViewTransition(update: () => void): void {
  if ("startViewTransition" in document) {
    document.startViewTransition(update);
  } else {
    update();
  }
}
