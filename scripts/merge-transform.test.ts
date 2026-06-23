import { createRequire } from "node:module";
import { describe, expect, it } from "vitest";

const requireFromTest = createRequire(import.meta.url);
const { transformSubject } = requireFromTest("./merge-transform.cjs") as {
  transformSubject: (rawData: unknown) => unknown;
};

const makeRawSubject = (overrides = {}) => ({
  bangumi: {
    id: 326,
    name: "Mushishi",
    name_cn: "虫师",
    images: { common: "https://lain.bgm.tv/pic.jpg" },
    summary: "A quiet story.",
    date: "2005-10-23",
    platform: "TV",
    eps: 26,
    total_episodes: 26,
    rating: {
      rank: 1,
      score: 8.9,
      total: 5000,
      count: { 9: 2000 },
    },
    collection: {
      wish: 10,
      collect: 4000,
      doing: 20,
      on_hold: 5,
      dropped: 1,
    },
    infobox: [
      { key: "动画制作", value: "Artland" },
      { key: "导演", value: "长滨博史" },
      { key: "脚本", value: [{ v: "伊丹昭" }, { v: "桑畑绢子" }] },
    ],
    tags: [
      { name: "治愈", count: 20 },
      { name: "奇幻", count: 30 },
    ],
    ...overrides,
  },
  bangumiData: {
    sites: [{ site: "bilibili", id: "123" }],
  },
});

describe("merge transform", () => {
  it("normalizes upstream Bangumi data into the frontend subject shape", () => {
    const subject = transformSubject(makeRawSubject());

    expect(subject).toMatchObject({
      id: 326,
      name: "Mushishi",
      cn: "虫师",
      year: 2005,
      month: 10,
      type: "TV",
      studio: "Artland",
      director: "长滨博史",
      writer: "伊丹昭 / 桑畑绢子",
      tags: ["奇幻", "治愈"],
      sites: [
        { site: "bangumi", id: "326" },
        { site: "bilibili", id: "123" },
      ],
    });
  });

  it("filters out low-confidence records", () => {
    expect(
      transformSubject(makeRawSubject({ rating: { rank: 1, score: 7, total: 49 } })),
    ).toBeNull();
    expect(
      transformSubject(makeRawSubject({ rating: { rank: 0, score: 7, total: 5000 } })),
    ).toBeNull();
  });

  it("ignores records without a Bangumi id", () => {
    expect(transformSubject({ bangumi: null })).toBeNull();
  });
});
