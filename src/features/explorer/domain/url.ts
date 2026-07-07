import { SUBJECT_TYPES, type SubjectType } from "@/shared/data/subject";
import {
  clampRange,
  DEFAULT_STATE,
  type ExplorerState,
  isDefaultRange,
  isSeason,
  isSeasonApplicable,
  isSortKey,
  isStatusFilter,
  isSubjectType,
  type Range,
  type RangeKey,
} from "./state";

/**
 * URL codec: the query string is the persisted, shareable form of
 * ExplorerState. Defaults are omitted so a pristine view is just `/`.
 *
 * Param contract (stable across the refactor, old links keep working):
 *   y/s/r/v/e = ranges as "min-max"   t = types, comma-separated
 *   q = search   st = status   sort = sort key   p = page   sn = season (new)
 */

const RANGE_PARAMS: Record<RangeKey, string> = {
  year: "y",
  score: "s",
  rank: "r",
  votes: "v",
  eps: "e",
};

function parseRange(params: URLSearchParams, key: RangeKey): Range {
  const raw = params.get(RANGE_PARAMS[key]);
  if (!raw) return DEFAULT_STATE.filters[key];

  const [min, max] = raw.split("-").map(Number);
  if (Number.isNaN(min) || Number.isNaN(max)) return DEFAULT_STATE.filters[key];

  return clampRange(key, [min, max]);
}

function parseTypes(params: URLSearchParams): ReadonlySet<SubjectType> {
  const raw = params.get("t");
  if (!raw) return DEFAULT_STATE.types;

  const types = new Set(raw.split(",").filter(isSubjectType));
  // An explicit but empty/garbage selection would show nothing; fall back to all.
  return types.size > 0 ? types : DEFAULT_STATE.types;
}

export function parseExplorerState(input: URLSearchParams | string): ExplorerState {
  const params = typeof input === "string" ? new URLSearchParams(input) : input;

  const filters = {
    year: parseRange(params, "year"),
    score: parseRange(params, "score"),
    rank: parseRange(params, "rank"),
    votes: parseRange(params, "votes"),
    eps: parseRange(params, "eps"),
  };

  const status = params.get("st") ?? "";
  const sort = params.get("sort") ?? "";
  const page = Number.parseInt(params.get("p") ?? "", 10);
  const season = Number.parseInt(params.get("sn") ?? "", 10);

  return {
    filters,
    types: parseTypes(params),
    search: params.get("q") ?? "",
    status: isStatusFilter(status) ? status : DEFAULT_STATE.status,
    sort: isSortKey(sort) ? sort : DEFAULT_STATE.sort,
    season: isSeason(season) && isSeasonApplicable(filters) ? season : null,
    page: Number.isInteger(page) && page > 1 ? page : 1,
  };
}

export function serializeExplorerState(state: ExplorerState): URLSearchParams {
  const params = new URLSearchParams();

  for (const key of Object.keys(RANGE_PARAMS) as RangeKey[]) {
    if (!isDefaultRange(key, state.filters[key])) {
      params.set(RANGE_PARAMS[key], state.filters[key].join("-"));
    }
  }

  const isDefaultTypes =
    state.types.size === SUBJECT_TYPES.length && SUBJECT_TYPES.every((t) => state.types.has(t));
  if (!isDefaultTypes) {
    // Serialize in canonical order so equal selections produce equal URLs.
    params.set("t", SUBJECT_TYPES.filter((t) => state.types.has(t)).join(","));
  }

  if (state.search) params.set("q", state.search);
  if (state.status !== DEFAULT_STATE.status) params.set("st", state.status);
  if (state.sort !== DEFAULT_STATE.sort) params.set("sort", state.sort);
  if (state.season !== null && isSeasonApplicable(state.filters)) {
    params.set("sn", state.season.toString());
  }
  if (state.page > 1) params.set("p", state.page.toString());

  return params;
}
