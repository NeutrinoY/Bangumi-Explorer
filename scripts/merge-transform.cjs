function findInfoValue(infobox, keys) {
  if (!infobox || !Array.isArray(infobox)) return null;

  for (const item of infobox) {
    if (keys.includes(item.key)) {
      if (Array.isArray(item.value)) {
        return item.value.map((value) => value.v).join(" / ");
      }
      return item.value;
    }
  }

  return null;
}

function normalizeType(typeRaw) {
  if (typeRaw === "剧场版" || typeRaw === "Movie" || typeRaw === "电影") return "Movie";
  if (typeRaw === "OVA" || typeRaw === "OAD") return "OVA";
  if (typeRaw === "Web" || typeRaw === "WEB" || typeRaw === "动态漫画" || typeRaw === "其他")
    return "Web";
  if (typeRaw === "电视剧" || typeRaw === "日剧") return "TV";
  return "TV";
}

function transformSubject(rawData) {
  const bgm = rawData?.bangumi;
  const extra = rawData?.bangumiData;

  if (!bgm?.id) return null;

  const rank = bgm.rating?.rank ? bgm.rating.rank : bgm.rank || 0;
  const score = bgm.rating ? bgm.rating.score : 0;
  const total = bgm.rating ? bgm.rating.total : 0;
  const collection = bgm.collection || {
    wish: 0,
    collect: 0,
    doing: 0,
    on_hold: 0,
    dropped: 0,
  };

  if (!rank || rank <= 0 || rank > 99999 || total < 50) return null;

  const id = bgm.id;
  const name = bgm.name;
  const cn = bgm.name_cn || name;
  const img = bgm.images ? bgm.images.common : "";
  const summary = bgm.summary || "";
  const date = bgm.date || bgm.air_date || "";
  const year = date ? Number.parseInt(date.substring(0, 4), 10) : 0;
  const month = date && date.length >= 7 ? Number.parseInt(date.substring(5, 7), 10) : 0;
  const score_chart = bgm.rating?.count ? bgm.rating.count : {};
  const type = normalizeType(bgm.platform || "TV");
  const eps = bgm.eps || 0;
  const total_eps = bgm.total_episodes || 0;

  const infobox = bgm.infobox || [];
  const studio =
    findInfoValue(infobox, ["动画制作", "制作", "Animation Work", "アニメーション制作"]) || "";
  const director = findInfoValue(infobox, ["导演", "监督", "Director"]) || "";
  const writer = findInfoValue(infobox, ["脚本", "系列构成", "Series Composition", "Script"]) || "";
  const music = findInfoValue(infobox, ["音乐", "Music"]) || "";
  const char_design = findInfoValue(infobox, ["人物设定", "角色设计", "Character Design"]) || "";
  const original = findInfoValue(infobox, ["原作", "Original Work"]) || "";

  const tags = bgm.tags
    ? [...bgm.tags]
        .sort((a, b) => b.count - a.count)
        .slice(0, 15)
        .map((tag) => tag.name)
    : [];

  const sites = [{ site: "bangumi", id: id.toString() }];
  if (extra?.sites) {
    const bili = extra.sites.find((site) => site.site === "bilibili");
    if (bili) sites.push({ site: "bilibili", id: bili.id });
  }

  return {
    id,
    name,
    cn,
    img,
    summary,
    date,
    year,
    month,
    type,
    eps,
    total_eps,
    score,
    rank,
    total,
    score_chart,
    collection,
    studio,
    director,
    writer,
    music,
    char_design,
    original,
    tags,
    sites,
  };
}

module.exports = {
  findInfoValue,
  transformSubject,
};
