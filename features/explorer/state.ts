export type ItemStatus = "collected" | "wishlist" | "ignored";
export type StatusFilterType = "todo" | "collected" | "ignored" | "all";
export type SortKey = "rank" | "score" | "date" | "collected";

export interface BangumiSubject {
  id: number;
  name: string;
  cn: string;
  img: string;
  summary: string;
  date: string;
  year: number;
  month: number;
  type: string;
  eps: number;
  total_eps: number;
  score: number;
  rank: number;
  total: number;
  score_chart: Record<string, number>;
  collection: {
    wish: number;
    collect: number;
    doing: number;
    on_hold: number;
    dropped: number;
  };
  studio: string;
  director: string;
  writer: string;
  music: string;
  char_design: string;
  original: string;
  tags: string[];
  sites: { site: string; id: string }[];
}

export interface ExplorerFilters {
  year: [number, number];
  score: [number, number];
  rank: [number, number];
  votes: [number, number];
  eps: [number, number];
}

export interface ExplorerState {
  filters: ExplorerFilters;
  selectedTypes: Set<string>;
  searchText: string;
  statusFilter: StatusFilterType;
  sortBy: SortKey;
  selectedSeason: number | null;
  page: number;
}

export const DEFAULT_EXPLORER_FILTERS: ExplorerFilters = {
  year: [0, 2030],
  score: [0, 10],
  rank: [0, 99999],
  votes: [0, 999999],
  eps: [0, 9999],
};

export const DEFAULT_SELECTED_TYPES = ["TV", "Movie", "OVA", "Web"] as const;

export const DEFAULT_EXPLORER_STATE: ExplorerState = {
  filters: DEFAULT_EXPLORER_FILTERS,
  selectedTypes: new Set(DEFAULT_SELECTED_TYPES),
  searchText: "",
  statusFilter: "all",
  sortBy: "rank",
  selectedSeason: null,
  page: 1,
};

const parseRange = (
  params: URLSearchParams,
  key: string,
  defaultRange: [number, number],
): [number, number] => {
  const value = params.get(key);
  if (!value) return defaultRange;

  const [min, max] = value.split("-").map(Number);
  if (Number.isNaN(min) || Number.isNaN(max)) return defaultRange;

  return [min, max];
};

const isStatusFilter = (value: string | null): value is StatusFilterType =>
  value === "todo" || value === "collected" || value === "ignored" || value === "all";

const isSortKey = (value: string | null): value is SortKey =>
  value === "rank" || value === "score" || value === "date" || value === "collected";

const isDefaultRange = (range: [number, number], defaultRange: [number, number]) =>
  range[0] === defaultRange[0] && range[1] === defaultRange[1];

const isDefaultTypes = (selectedTypes: Set<string>) =>
  selectedTypes.size === DEFAULT_SELECTED_TYPES.length &&
  DEFAULT_SELECTED_TYPES.every((type) => selectedTypes.has(type));

export function parseExplorerState(input: URLSearchParams | string): ExplorerState {
  const params = typeof input === "string" ? new URLSearchParams(input) : input;
  const defaults = DEFAULT_EXPLORER_STATE;

  const page = Number.parseInt(params.get("p") ?? "1", 10);
  const typeParam = params.get("t");
  const status = params.get("st");
  const sort = params.get("sort");

  return {
    filters: {
      year: parseRange(params, "y", defaults.filters.year),
      score: parseRange(params, "s", defaults.filters.score),
      rank: parseRange(params, "r", defaults.filters.rank),
      votes: parseRange(params, "v", defaults.filters.votes),
      eps: parseRange(params, "e", defaults.filters.eps),
    },
    selectedTypes: typeParam
      ? new Set(typeParam.split(",").filter(Boolean))
      : new Set(defaults.selectedTypes),
    searchText: params.get("q") ?? defaults.searchText,
    statusFilter: isStatusFilter(status) ? status : defaults.statusFilter,
    sortBy: isSortKey(sort) ? sort : defaults.sortBy,
    selectedSeason: defaults.selectedSeason,
    page: Number.isNaN(page) || page < 1 ? defaults.page : page,
  };
}

export function serializeExplorerState(state: ExplorerState): URLSearchParams {
  const params = new URLSearchParams();
  const defaults = DEFAULT_EXPLORER_STATE;

  if (!isDefaultRange(state.filters.year, defaults.filters.year))
    params.set("y", state.filters.year.join("-"));
  if (!isDefaultRange(state.filters.score, defaults.filters.score))
    params.set("s", state.filters.score.join("-"));
  if (!isDefaultRange(state.filters.rank, defaults.filters.rank))
    params.set("r", state.filters.rank.join("-"));
  if (!isDefaultRange(state.filters.votes, defaults.filters.votes))
    params.set("v", state.filters.votes.join("-"));
  if (!isDefaultRange(state.filters.eps, defaults.filters.eps))
    params.set("e", state.filters.eps.join("-"));
  if (!isDefaultTypes(state.selectedTypes))
    params.set("t", Array.from(state.selectedTypes).join(","));
  if (state.searchText) params.set("q", state.searchText);
  if (state.statusFilter !== defaults.statusFilter) params.set("st", state.statusFilter);
  if (state.sortBy !== defaults.sortBy) params.set("sort", state.sortBy);
  if (state.page > 1) params.set("p", state.page.toString());

  return params;
}

export function filterSubjects(
  subjects: BangumiSubject[],
  state: ExplorerState,
  getStatus: (id: number) => ItemStatus | null,
): BangumiSubject[] {
  const query = state.searchText.toLowerCase().trim();

  return subjects.filter((item) => {
    const status = getStatus(item.id);
    if (state.statusFilter === "todo") {
      if (status === "collected" || status === "ignored") return false;
    } else if (state.statusFilter === "collected") {
      if (status !== "collected") return false;
    } else if (state.statusFilter === "ignored") {
      if (status !== "ignored") return false;
    }

    if ((item.score || 0) < state.filters.score[0] || (item.score || 0) > state.filters.score[1])
      return false;

    const rank = item.rank && item.rank > 0 ? item.rank : 999999;
    if (rank < state.filters.rank[0] || rank > state.filters.rank[1]) return false;

    const votes = item.total || 0;
    if (votes < state.filters.votes[0] || votes > state.filters.votes[1]) return false;

    const year = item.year || 0;
    if (year < state.filters.year[0] || year > state.filters.year[1]) return false;

    const eps = item.eps || 0;
    if (eps < state.filters.eps[0] || eps > state.filters.eps[1]) return false;

    if (state.selectedSeason !== null && state.filters.year[0] === state.filters.year[1]) {
      const month = item.month || 0;
      if (month < state.selectedSeason || month > state.selectedSeason + 2) return false;
    }

    if (state.selectedTypes.size > 0) {
      const type = item.type || "";
      const matchesType = Array.from(state.selectedTypes).some((selectedType) =>
        type.toLowerCase().includes(selectedType.toLowerCase()),
      );
      if (!matchesType) return false;
    }

    if (query) {
      const inName = (item.name || "").toLowerCase().includes(query);
      const inCn = (item.cn || "").toLowerCase().includes(query);
      const inStudio = (item.studio || "").toLowerCase().includes(query);
      const inDirector = (item.director || "").toLowerCase().includes(query);
      const inWriter = (item.writer || "").toLowerCase().includes(query);
      const inId = item.id.toString() === query;
      if (!inName && !inCn && !inStudio && !inDirector && !inWriter && !inId) return false;
    }

    return true;
  });
}

export function sortSubjects(subjects: BangumiSubject[], sortBy: SortKey): BangumiSubject[] {
  return [...subjects].sort((a, b) => {
    switch (sortBy) {
      case "score":
        return (b.score || 0) - (a.score || 0);
      case "date":
        return (b.date || "").localeCompare(a.date || "");
      case "collected":
        return (b.collection?.collect || 0) - (a.collection?.collect || 0);
      default: {
        const rankA = a.rank && a.rank > 0 ? a.rank : 999999;
        const rankB = b.rank && b.rank > 0 ? b.rank : 999999;
        if (rankA !== rankB) return rankA - rankB;
        return (b.score || 0) - (a.score || 0);
      }
    }
  });
}

export function getVisibleSubjects<T>(subjects: T[], page: number, pageSize: number): T[] {
  return subjects.slice((page - 1) * pageSize, page * pageSize);
}
