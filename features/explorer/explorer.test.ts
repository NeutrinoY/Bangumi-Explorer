import { describe, expect, it } from "vitest";
import {
  type BangumiSubject,
  DEFAULT_EXPLORER_STATE,
  type ExplorerState,
  filterSubjects,
  getVisibleSubjects,
  parseExplorerState,
  serializeExplorerState,
  sortSubjects,
} from "./state";

const baseSubject: BangumiSubject = {
  id: 1,
  name: "Cowboy Bebop",
  cn: "星际牛仔",
  img: "",
  summary: "",
  date: "1998-04-03",
  year: 1998,
  month: 4,
  type: "TV",
  eps: 26,
  total_eps: 26,
  score: 8.9,
  rank: 2,
  total: 12000,
  score_chart: {},
  collection: {
    wish: 0,
    collect: 10000,
    doing: 0,
    on_hold: 0,
    dropped: 0,
  },
  studio: "SUNRISE",
  director: "渡边信一郎",
  writer: "",
  music: "",
  char_design: "",
  original: "",
  tags: ["科幻"],
  sites: [{ site: "bangumi", id: "1" }],
};

const makeSubject = (overrides: Partial<BangumiSubject>): BangumiSubject => ({
  ...baseSubject,
  ...overrides,
  collection: {
    ...baseSubject.collection,
    ...overrides.collection,
  },
});

describe("explorer state", () => {
  it("filters by numeric ranges, type, season, search text, and collection status", () => {
    const subjects = [
      makeSubject({ id: 1, cn: "星际牛仔", year: 1998, month: 4, type: "TV", rank: 2 }),
      makeSubject({ id: 2, cn: "攻壳机动队", year: 1995, month: 11, type: "Movie", rank: 10 }),
      makeSubject({ id: 3, cn: "孤独摇滚", year: 2022, month: 10, type: "TV", rank: 100 }),
    ];

    const state: ExplorerState = {
      ...DEFAULT_EXPLORER_STATE,
      filters: {
        ...DEFAULT_EXPLORER_STATE.filters,
        year: [1998, 1998],
        rank: [0, 50],
      },
      selectedSeason: 4,
      selectedTypes: new Set(["TV"]),
      searchText: "sunrise",
      statusFilter: "todo",
    };

    const result = filterSubjects(subjects, state, (id) => (id === 2 ? "collected" : null));

    expect(result.map((item) => item.id)).toEqual([1]);
  });

  it("sorts ranked subjects before unranked subjects and uses score as a tie-breaker", () => {
    const subjects = [
      makeSubject({ id: 1, rank: 10, score: 8.1 }),
      makeSubject({ id: 2, rank: 0, score: 9.9 }),
      makeSubject({ id: 3, rank: 10, score: 8.8 }),
    ];

    expect(sortSubjects(subjects, "rank").map((item) => item.id)).toEqual([3, 1, 2]);
  });

  it("serializes and parses URL state without writing default values", () => {
    const state: ExplorerState = {
      ...DEFAULT_EXPLORER_STATE,
      filters: {
        ...DEFAULT_EXPLORER_STATE.filters,
        year: [2022, 2022],
      },
      selectedTypes: new Set(["TV"]),
      searchText: "bocchi",
      statusFilter: "ignored",
      sortBy: "date",
      page: 3,
    };

    const params = serializeExplorerState(state);
    const parsed = parseExplorerState(params);

    expect(params.toString()).toBe("y=2022-2022&t=TV&q=bocchi&st=ignored&sort=date&p=3");
    expect(parsed).toEqual(state);
    expect(serializeExplorerState(DEFAULT_EXPLORER_STATE).toString()).toBe("");
  });

  it("returns one page of visible subjects", () => {
    const subjects = Array.from({ length: 65 }, (_, index) =>
      makeSubject({ id: index + 1, rank: index + 1 }),
    );

    expect(getVisibleSubjects(subjects, 2, 60).map((item) => item.id)).toEqual([
      61, 62, 63, 64, 65,
    ]);
  });
});
