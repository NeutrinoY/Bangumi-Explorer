import type { ItemStatus } from "@/features/collection/domain";
import type { SubjectIndex } from "@/shared/data/subject";
import {
  type ExplorerState,
  isEpsFilterApplicable,
  isSeasonApplicable,
  PAGE_SIZE,
  type SortKey,
} from "./state";

/**
 * Filtering and sorting over the subject index. Pure functions: the whole
 * "instant filtering" experience is these running over the in-memory index.
 */

/** Subjects without a rank sort after every ranked one. */
const UNRANKED = Number.MAX_SAFE_INTEGER;

const effectiveRank = (subject: SubjectIndex): number =>
  subject.rank > 0 ? subject.rank : UNRANKED;

type GetStatus = (id: number) => ItemStatus | null;

function matchesStatus(state: ExplorerState, status: ItemStatus | null): boolean {
  switch (state.status) {
    case "all":
      return true;
    // "todo" means not yet triaged; wishlist items are still open decisions,
    // so they stay visible in the todo view.
    case "todo":
      return status === null || status === "wishlist";
    default:
      return status === state.status;
  }
}

function matchesSearch(subject: SubjectIndex, query: string): boolean {
  return (
    subject.name.toLowerCase().includes(query) ||
    subject.cn.toLowerCase().includes(query) ||
    subject.studio.toLowerCase().includes(query) ||
    subject.director.toLowerCase().includes(query) ||
    subject.writer.toLowerCase().includes(query) ||
    subject.id.toString() === query
  );
}

function inRange(value: number, [min, max]: readonly [number, number]): boolean {
  return value >= min && value <= max;
}

export function filterSubjects(
  subjects: readonly SubjectIndex[],
  state: ExplorerState,
  getStatus: GetStatus,
): SubjectIndex[] {
  const query = state.search.trim().toLowerCase();
  const seasonActive = state.season !== null && isSeasonApplicable(state.filters);
  const epsActive = isEpsFilterApplicable(state.types);

  return subjects.filter((subject) => {
    if (!matchesStatus(state, getStatus(subject.id))) return false;

    if (!inRange(subject.year, state.filters.year)) return false;
    if (!inRange(subject.score, state.filters.score)) return false;
    if (!inRange(effectiveRank(subject), state.filters.rank)) return false;
    if (!inRange(subject.total, state.filters.votes)) return false;
    if (epsActive && !inRange(subject.eps, state.filters.eps)) return false;

    if (seasonActive && state.season !== null) {
      // A season covers its starting month plus the following two.
      if (subject.month < state.season || subject.month > state.season + 2) return false;
    }

    if (!state.types.has(subject.type)) return false;

    if (query && !matchesSearch(subject, query)) return false;

    return true;
  });
}

const COMPARATORS: Record<SortKey, (a: SubjectIndex, b: SubjectIndex) => number> = {
  // Rank ascending, score descending as tie-breaker (also orders the unranked tail).
  rank: (a, b) => effectiveRank(a) - effectiveRank(b) || b.score - a.score,
  score: (a, b) => b.score - a.score,
  date: (a, b) => b.date.localeCompare(a.date),
  collected: (a, b) => b.collect - a.collect,
};

export function sortSubjects(subjects: readonly SubjectIndex[], sort: SortKey): SubjectIndex[] {
  return [...subjects].sort(COMPARATORS[sort]);
}

export function pageCount(totalItems: number): number {
  return Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
}

/** Pages outside the valid range are clamped, never allowed to show an empty view. */
export function clampPage(page: number, totalItems: number): number {
  return Math.min(Math.max(1, page), pageCount(totalItems));
}

export function pageSlice<T>(items: readonly T[], page: number): T[] {
  const current = clampPage(page, items.length);
  return items.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);
}
