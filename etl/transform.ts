import type { SubjectDetail, SubjectIndex, SubjectType } from "../src/shared/data/subject";
import type { RawSubject } from "./schemas";

/**
 * Pure transform: one validated upstream record → index entry + detail record,
 * or null when the record doesn't meet the quality bar.
 *
 * Quality bar (unchanged from the original pipeline): a subject must be
 * ranked (1..99999) and have at least 50 votes. This keeps unrated noise and
 * barely-rated entries out of the browsing experience.
 */

const MIN_VOTES = 50;
const MAX_RANK = 99999;
const TAG_LIMIT = 15;

type Infobox = NonNullable<NonNullable<RawSubject["bangumi"]>["infobox"]>;

function infoboxValue(infobox: Infobox | null | undefined, keys: readonly string[]): string {
  for (const entry of infobox ?? []) {
    if (keys.includes(entry.key)) {
      return Array.isArray(entry.value)
        ? entry.value.map((item) => item.v).join(" / ")
        : entry.value;
    }
  }
  return "";
}

function normalizeType(platform: string | null | undefined): SubjectType {
  switch (platform) {
    case "剧场版":
    case "Movie":
    case "电影":
      return "Movie";
    case "OVA":
    case "OAD":
      return "OVA";
    case "Web":
    case "WEB":
    case "动态漫画":
    case "其他":
      return "Web";
    default:
      // TV, 电视剧, 日剧 and anything new upstream invents.
      return "TV";
  }
}

export interface TransformedSubject {
  index: SubjectIndex;
  detail: SubjectDetail;
}

export function transformSubject(raw: RawSubject): TransformedSubject | null {
  const bgm = raw.bangumi;
  if (!bgm?.id) return null;

  const rank = bgm.rating?.rank || bgm.rank || 0;
  const total = bgm.rating?.total ?? 0;
  if (rank <= 0 || rank > MAX_RANK || total < MIN_VOTES) return null;

  const date = bgm.date || bgm.air_date || "";
  const year = date ? Number.parseInt(date.slice(0, 4), 10) || 0 : 0;
  const month = date.length >= 7 ? Number.parseInt(date.slice(5, 7), 10) || 0 : 0;

  const infobox = bgm.infobox;
  const name = bgm.name ?? "";

  const index: SubjectIndex = {
    id: bgm.id,
    name,
    cn: bgm.name_cn || name,
    img: bgm.images?.common ?? "",
    type: normalizeType(bgm.platform),
    date,
    year,
    month,
    eps: bgm.eps ?? 0,
    score: bgm.rating?.score ?? 0,
    rank,
    total,
    collect: bgm.collection?.collect ?? 0,
    studio: infoboxValue(infobox, ["动画制作", "制作", "Animation Work", "アニメーション制作"]),
    director: infoboxValue(infobox, ["导演", "监督", "Director"]),
    writer: infoboxValue(infobox, ["脚本", "系列构成", "Series Composition", "Script"]),
  };

  const sites: SubjectDetail["sites"] = [{ site: "bangumi", id: bgm.id.toString() }];
  const bilibili = raw.bangumiData?.sites?.find((site) => site.site === "bilibili");
  if (bilibili) sites.push({ site: "bilibili", id: bilibili.id });

  const detail: SubjectDetail = {
    id: bgm.id,
    summary: bgm.summary ?? "",
    scoreChart: bgm.rating?.count ?? {},
    collection: {
      wish: bgm.collection?.wish ?? 0,
      collect: bgm.collection?.collect ?? 0,
      doing: bgm.collection?.doing ?? 0,
      onHold: bgm.collection?.on_hold ?? 0,
      dropped: bgm.collection?.dropped ?? 0,
    },
    music: infoboxValue(infobox, ["音乐", "Music"]),
    charDesign: infoboxValue(infobox, ["人物设定", "角色设计", "Character Design"]),
    original: infoboxValue(infobox, ["原作", "Original Work"]),
    tags: (bgm.tags ?? [])
      .toSorted((a, b) => b.count - a.count)
      .slice(0, TAG_LIMIT)
      .map((tag) => tag.name),
    sites,
  };

  return { index, detail };
}
