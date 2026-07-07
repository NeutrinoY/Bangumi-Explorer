import type { SubjectType } from "@/shared/data/subject";
import { isPresetActive, type Preset } from "./presets";
import {
  clampRange,
  DEFAULT_STATE,
  type ExplorerState,
  isSeasonApplicable,
  type Range,
  type RangeKey,
  type Season,
  type SortKey,
  type StatusFilter,
} from "./state";

/**
 * All explorer state transitions. Cross-field rules that used to hide in
 * component effects live here as explicit reducer logic:
 * - any change that alters the result set resets pagination;
 * - the season filter is dropped as soon as the year range stops pinning a year;
 * - toggling the last active type off is ignored (an empty type set shows nothing).
 */

export type ExplorerAction =
  | { kind: "range-set"; key: RangeKey; range: Range }
  | { kind: "type-toggle"; type: SubjectType }
  | { kind: "search-set"; search: string }
  | { kind: "status-set"; status: StatusFilter }
  | { kind: "sort-set"; sort: SortKey }
  | { kind: "season-set"; season: Season | null }
  | { kind: "preset-toggle"; preset: Preset }
  | { kind: "page-set"; page: number }
  | { kind: "reset" }
  | { kind: "hydrate"; state: ExplorerState };

/** Re-derive the fields that depend on other fields, and restart pagination. */
function normalize(state: ExplorerState): ExplorerState {
  return {
    ...state,
    season: isSeasonApplicable(state.filters) ? state.season : null,
    page: 1,
  };
}

export function explorerReducer(state: ExplorerState, action: ExplorerAction): ExplorerState {
  switch (action.kind) {
    case "range-set":
      return normalize({
        ...state,
        filters: { ...state.filters, [action.key]: clampRange(action.key, action.range) },
      });

    case "type-toggle": {
      const types = new Set(state.types);
      if (types.has(action.type)) {
        types.delete(action.type);
      } else {
        types.add(action.type);
      }
      if (types.size === 0) return state;
      return normalize({ ...state, types });
    }

    case "search-set":
      return normalize({ ...state, search: action.search });

    case "status-set":
      return normalize({ ...state, status: action.status });

    // Sorting reorders the whole result set, so staying on page N would show
    // arbitrary items; jump back to the top like every other reshuffle.
    case "sort-set":
      return normalize({ ...state, sort: action.sort });

    case "season-set":
      return normalize({ ...state, season: action.season });

    case "preset-toggle": {
      if (isPresetActive(action.preset, state)) {
        // Second click reverts exactly the knobs presets control.
        return normalize({
          ...state,
          filters: DEFAULT_STATE.filters,
          types: DEFAULT_STATE.types,
        });
      }
      return normalize({
        ...state,
        filters: {
          ...DEFAULT_STATE.filters,
          year: action.preset.filters.year,
          votes: action.preset.filters.votes,
          // Presets leave the eps knob alone: "Max 52 Eps" composes with them.
          eps: state.filters.eps,
        },
        types: new Set(action.preset.types),
      });
    }

    case "page-set":
      // Bounds depend on the filtered result size, which the domain layer
      // doesn't know here; the UI passes a pre-clamped value.
      return { ...state, page: Math.max(1, action.page) };

    case "reset":
      return DEFAULT_STATE;

    case "hydrate":
      return action.state;
  }
}
