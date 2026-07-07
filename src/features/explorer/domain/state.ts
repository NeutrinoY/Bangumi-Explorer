import { SUBJECT_TYPES, type SubjectType } from "@/shared/data/subject";

/**
 * Explorer state model: every user-adjustable knob of the browse view.
 * All defaults live here — the URL codec, the reducer and the UI all
 * derive from these definitions.
 */

export type RangeKey = "year" | "score" | "rank" | "votes" | "eps";
export type Range = readonly [number, number];

export type StatusFilter = "all" | "todo" | "collected" | "wishlist" | "ignored";
export type SortKey = "rank" | "score" | "date" | "collected";

/** Calendar month (1/4/7/10) that starts the season, or null = no season filter. */
export type Season = 1 | 4 | 7 | 10;

export interface ExplorerFilters {
  year: Range;
  score: Range;
  rank: Range;
  votes: Range;
  eps: Range;
}

export interface ExplorerState {
  filters: ExplorerFilters;
  types: ReadonlySet<SubjectType>;
  search: string;
  status: StatusFilter;
  sort: SortKey;
  season: Season | null;
  page: number;
}

/**
 * Hard bounds for each range filter. Also the default (= "no restriction")
 * value: a filter is considered inactive while it spans its full bounds.
 */
export const RANGE_BOUNDS: Record<RangeKey, Range> = {
  year: [0, 2030],
  score: [0, 10],
  rank: [0, 99999],
  votes: [0, 999999],
  eps: [0, 9999],
};

export const PAGE_SIZE = 60;

export const DEFAULT_STATE: ExplorerState = {
  filters: {
    year: RANGE_BOUNDS.year,
    score: RANGE_BOUNDS.score,
    rank: RANGE_BOUNDS.rank,
    votes: RANGE_BOUNDS.votes,
    eps: RANGE_BOUNDS.eps,
  },
  types: new Set(SUBJECT_TYPES),
  search: "",
  status: "all",
  sort: "rank",
  season: null,
  page: 1,
};

export const STATUS_FILTERS: readonly StatusFilter[] = [
  "all",
  "todo",
  "collected",
  "wishlist",
  "ignored",
];

export const SORT_KEYS: readonly SortKey[] = ["rank", "score", "date", "collected"];

export const SEASONS: readonly Season[] = [1, 4, 7, 10];

export function isStatusFilter(value: string): value is StatusFilter {
  return (STATUS_FILTERS as readonly string[]).includes(value);
}

export function isSortKey(value: string): value is SortKey {
  return (SORT_KEYS as readonly string[]).includes(value);
}

export function isSeason(value: number): value is Season {
  return (SEASONS as readonly number[]).includes(value);
}

export function isSubjectType(value: string): value is SubjectType {
  return (SUBJECT_TYPES as readonly string[]).includes(value);
}

/** The season filter only applies when the year range pins a single year. */
export function isSeasonApplicable(filters: ExplorerFilters): boolean {
  return filters.year[0] === filters.year[1];
}

/**
 * Episode-count filtering is meaningless when the view is movies-only
 * (movies are single-episode by nature). Mixed views keep it available.
 */
export function isEpsFilterApplicable(types: ReadonlySet<SubjectType>): boolean {
  return !(types.size === 1 && types.has("Movie"));
}

export function clampRange(key: RangeKey, range: Range): Range {
  const [boundMin, boundMax] = RANGE_BOUNDS[key];
  const min = Math.min(Math.max(range[0], boundMin), boundMax);
  const max = Math.min(Math.max(range[1], boundMin), boundMax);
  return min <= max ? [min, max] : [max, min];
}

export function isDefaultRange(key: RangeKey, range: Range): boolean {
  return range[0] === RANGE_BOUNDS[key][0] && range[1] === RANGE_BOUNDS[key][1];
}
