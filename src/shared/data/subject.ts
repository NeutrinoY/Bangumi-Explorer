/**
 * Data contract between the ETL pipeline and the frontend.
 *
 * The ETL emits two artifacts from upstream Bangumi data:
 * - `public/data/index.json`  — SubjectIndex[]: everything browsing, filtering,
 *   searching and sorting need. Loaded once, kept in memory.
 * - `public/data/details/{id}.json` — SubjectDetail: heavy fields fetched on
 *   demand when a subject's detail view opens.
 *
 * These plain types are the single source of truth for that contract; the zod
 * schemas in `etl/schemas.ts` are typed against them so the pipeline cannot
 * drift from the frontend silently. (zod itself stays out of the client bundle.)
 */

export const SUBJECT_TYPES = ["TV", "Movie", "OVA", "Web"] as const;
export type SubjectType = (typeof SUBJECT_TYPES)[number];

export interface SubjectIndex {
  id: number;
  /** Original (usually Japanese) title. */
  name: string;
  /** Chinese title; falls back to `name` in the ETL when missing. */
  cn: string;
  /** Cover image URL; empty string when the subject has none. */
  img: string;
  type: SubjectType;
  /** Full air date `YYYY-MM-DD` (may be partial/empty upstream); used by date sort. */
  date: string;
  /** 0 when the air date is unknown. */
  year: number;
  /** 1-12, or 0 when unknown; drives the season filter. */
  month: number;
  /** Main episode count; 0 when unknown. */
  eps: number;
  score: number;
  /** Bangumi rank; always > 0 (unranked subjects are dropped by the ETL). */
  rank: number;
  /** Number of rating votes. */
  total: number;
  /** Community "collected" count; drives the popularity sort. */
  collect: number;
  // Staff fields live in the index (not detail) because text search covers them.
  studio: string;
  director: string;
  writer: string;
}

export interface SiteRef {
  site: string;
  id: string;
}

export interface SubjectDetail {
  id: number;
  summary: string;
  /** Vote count per score bucket, keys "1".."10". */
  scoreChart: Record<string, number>;
  collection: {
    wish: number;
    collect: number;
    doing: number;
    onHold: number;
    dropped: number;
  };
  music: string;
  charDesign: string;
  original: string;
  tags: string[];
  sites: SiteRef[];
}

export const SUBJECT_INDEX_URL = "/data/index.json";

/**
 * Details are packed into hash buckets (id % DETAIL_BUCKETS) rather than one
 * file per subject: keeps the repo tidy (9 data files total) while a single
 * bucket (~500KB) is cheap enough to fetch on first detail open. All buckets
 * are prefetched in the background after the index loads.
 */
export const DETAIL_BUCKETS = 8;

export function detailBucketUrl(bucket: number): string {
  return `/data/details-${bucket}.json`;
}

export function detailBucketOf(id: number): number {
  return id % DETAIL_BUCKETS;
}
