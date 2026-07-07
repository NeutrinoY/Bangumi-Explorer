import type { SubjectType } from "@/shared/data/subject";
import type { ExplorerFilters, ExplorerState } from "./state";
import { DEFAULT_STATE, RANGE_BOUNDS } from "./state";

/**
 * Quick filter presets. A preset pins the year/votes window and the type
 * selection; rank/score stay unrestricted. Clicking an active preset
 * reverts those knobs to defaults (handled by the reducer).
 *
 * Vote thresholds encode the product's notion of "hit" vs "hidden gem":
 * series need 2000+ votes to count as a hit, 1000-1999 is gem territory;
 * movies get a lower 500 gem floor since their vote volume runs smaller.
 * 2005/2006 is the retro/modern boundary.
 */

export type PresetId =
  | "modern-hits"
  | "modern-gems"
  | "retro-classics"
  | "retro-cult"
  | "movie-hits"
  | "movie-gems";

export interface Preset {
  id: PresetId;
  label: string;
  filters: Pick<ExplorerFilters, "year" | "votes">;
  types: readonly SubjectType[];
}

const SERIES: readonly SubjectType[] = ["TV", "OVA", "Web"];
const MOVIE: readonly SubjectType[] = ["Movie"];

export const PRESETS: readonly Preset[] = [
  {
    id: "modern-hits",
    label: "Modern Hits",
    filters: { year: [2006, 2026], votes: [2000, RANGE_BOUNDS.votes[1]] },
    types: SERIES,
  },
  {
    id: "modern-gems",
    label: "Modern Gems",
    filters: { year: [2006, 2026], votes: [1000, 1999] },
    types: SERIES,
  },
  {
    id: "retro-classics",
    label: "Retro Classics",
    filters: { year: [RANGE_BOUNDS.year[0], 2005], votes: [2000, RANGE_BOUNDS.votes[1]] },
    types: SERIES,
  },
  {
    id: "retro-cult",
    label: "Retro Cult",
    filters: { year: [RANGE_BOUNDS.year[0], 2005], votes: [1000, 1999] },
    types: SERIES,
  },
  {
    id: "movie-hits",
    label: "Movie Hits",
    filters: { year: RANGE_BOUNDS.year, votes: [2000, RANGE_BOUNDS.votes[1]] },
    types: MOVIE,
  },
  {
    id: "movie-gems",
    label: "Movie Gems",
    filters: { year: RANGE_BOUNDS.year, votes: [500, 1999] },
    types: MOVIE,
  },
];

const sameRange = (a: readonly [number, number], b: readonly [number, number]) =>
  a[0] === b[0] && a[1] === b[1];

/**
 * A preset reads as active when every knob it controls matches exactly —
 * including the knobs it resets to defaults (rank/score), so manual tweaks
 * on top of a preset make it read as inactive.
 */
export function isPresetActive(preset: Preset, state: ExplorerState): boolean {
  return (
    sameRange(state.filters.year, preset.filters.year) &&
    sameRange(state.filters.votes, preset.filters.votes) &&
    sameRange(state.filters.rank, DEFAULT_STATE.filters.rank) &&
    sameRange(state.filters.score, DEFAULT_STATE.filters.score) &&
    state.types.size === preset.types.length &&
    preset.types.every((t) => state.types.has(t))
  );
}
