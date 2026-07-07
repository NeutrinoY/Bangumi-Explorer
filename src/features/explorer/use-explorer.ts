"use client";

import { useEffect, useMemo, useReducer, useRef } from "react";
import type { ItemStatus } from "@/features/collection/domain";
import type { SubjectIndex } from "@/shared/data/subject";
import { type ExplorerAction, explorerReducer } from "./domain/actions";
import { clampPage, filterSubjects, pageCount, pageSlice, sortSubjects } from "./domain/query";
import { type ExplorerState, PAGE_SIZE } from "./domain/state";
import { parseExplorerState, serializeExplorerState } from "./domain/url";

export interface ExplorerView {
  state: ExplorerState;
  dispatch: (action: ExplorerAction) => void;
  /** Filtered + sorted result set (all pages). */
  results: SubjectIndex[];
  /** The slice for the current page. */
  visible: SubjectIndex[];
  /** Current page after clamping to the result size. */
  page: number;
  totalPages: number;
  pageSize: number;
}

/**
 * How long a burst of state changes may sit before it's written to the URL.
 * Keystrokes in the search box fire per character; Safari rate-limits
 * replaceState calls, so the URL write is debounced while filtering itself
 * stays instant.
 */
const URL_WRITE_DELAY_MS = 300;

/**
 * The explorer's single stateful surface: one reducer over ExplorerState,
 * with the URL as a debounced persistence projection. State initializes
 * from the URL exactly once (lazy init), so shared links restore the view.
 */
export function useExplorer(
  subjects: readonly SubjectIndex[],
  getStatus: (id: number) => ItemStatus | null,
): ExplorerView {
  const [state, dispatch] = useReducer(explorerReducer, undefined, () =>
    parseExplorerState(typeof window === "undefined" ? "" : window.location.search),
  );

  const results = useMemo(
    () => sortSubjects(filterSubjects(subjects, state, getStatus), state.sort),
    [subjects, state, getStatus],
  );

  // A stale page (e.g. filters narrowed while on page 9) clamps instead of
  // rendering a misleading empty view.
  const page = clampPage(state.page, results.length);
  const visible = useMemo(() => pageSlice(results, page), [results, page]);

  // --- URL projection ---
  const urlTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isFirstRender = useRef(true);

  useEffect(() => {
    // The initial state came *from* the URL; writing it back immediately
    // would just add noise (and clobber params we deliberately ignore).
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    if (urlTimer.current) clearTimeout(urlTimer.current);
    urlTimer.current = setTimeout(() => {
      const query = serializeExplorerState(state).toString();
      const next = query ? `?${query}` : window.location.pathname;
      // history.replaceState instead of router.replace: purely cosmetic URL
      // bookkeeping that shouldn't touch the Next.js router or trigger RSC work.
      window.history.replaceState(null, "", next);
    }, URL_WRITE_DELAY_MS);

    return () => {
      if (urlTimer.current) clearTimeout(urlTimer.current);
    };
  }, [state]);

  return {
    state,
    dispatch,
    results,
    visible,
    page,
    totalPages: pageCount(results.length),
    pageSize: PAGE_SIZE,
  };
}
