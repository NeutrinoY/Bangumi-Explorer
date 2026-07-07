"use client";

import {
  Ban,
  Bookmark,
  Calendar,
  Check,
  CloudRain,
  Layers,
  ListFilter,
  Search,
  SlidersHorizontal,
  Snowflake,
  Star,
  Sun,
  Trophy,
  Users,
  Wind,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import type { ExplorerAction } from "@/features/explorer/domain/actions";
import {
  type ExplorerState,
  isEpsFilterApplicable,
  isSeasonApplicable,
  RANGE_BOUNDS,
  type RangeKey,
  type Season,
  type StatusFilter,
} from "@/features/explorer/domain/state";
import { SUBJECT_TYPES } from "@/shared/data/subject";
import { cn } from "@/shared/ui/cn";
import { NumberField } from "@/shared/ui/number-field";
import { useClickOutside } from "@/shared/ui/use-click-outside";
import { MOBILE_QUERY, useMediaQuery } from "@/shared/ui/use-media-query";
import { PresetRow } from "./preset-row";
import { SortSelect } from "./sort-select";

interface FilterPanelProps {
  state: ExplorerState;
  dispatch: (action: ExplorerAction) => void;
  resultCount: number;
}

/**
 * Sticky top bar (brand, search, sort, filter toggle) plus the expandable
 * filter surface (presets, ranges, types, season, status, reset).
 */
export function FilterPanel({ state, dispatch, resultCount }: FilterPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useClickOutside<HTMLDivElement>(isOpen, () => setIsOpen(false));
  // Mobile opens as a bottom sheet; desktop drops down from the sticky bar.
  const isMobile = useMediaQuery(MOBILE_QUERY);

  return (
    <div ref={panelRef} className="sticky top-0 z-50">
      <div className="absolute inset-0 z-0 border-b border-neutral-800 bg-neutral-950/80 shadow-sm backdrop-blur-xl" />

      <div className="relative z-10 mx-auto max-w-[1920px] px-4 py-4 sm:px-6">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex w-full shrink-0 items-center justify-between gap-6 md:w-auto md:justify-start">
            <Brand resultCount={resultCount} />

            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              aria-expanded={isOpen}
              aria-label="Toggle filters"
              className={cn(
                "flex min-h-11 min-w-11 items-center justify-center rounded-xl border transition-colors md:hidden",
                isOpen
                  ? "border-pink-500 bg-pink-600 text-white"
                  : "border-neutral-800 bg-neutral-900 text-neutral-400",
              )}
            >
              <SlidersHorizontal size={18} />
            </button>
          </div>

          <SearchBox
            className="group relative hidden w-full max-w-xl md:block"
            value={state.search}
            onChange={(search) => dispatch({ kind: "search-set", search })}
            placeholder="Search anime title, studio, staff..."
          />

          <div className="hidden items-center gap-6 md:flex">
            <SortSelect
              value={state.sort}
              onChange={(sort) => dispatch({ kind: "sort-set", sort })}
            />

            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              aria-expanded={isOpen}
              className={cn(
                "flex min-h-10 items-center gap-2 rounded-full border px-5 py-2 text-xs font-bold tracking-wide shadow-sm transition-colors",
                isOpen
                  ? "border-white bg-neutral-100 text-black"
                  : "border-neutral-800 bg-neutral-900 text-neutral-400 hover:border-neutral-600 hover:text-neutral-200",
              )}
            >
              <SlidersHorizontal size={14} strokeWidth={2.5} />
              <span>FILTERS</span>
            </button>
          </div>
        </div>

        {/* Mobile search + sort */}
        <div className="mt-4 flex items-center gap-3 md:hidden">
          <SearchBox
            className="relative flex-1"
            value={state.search}
            onChange={(search) => dispatch({ kind: "search-set", search })}
            placeholder="Search..."
          />
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={isMobile ? { y: "100%" } : { opacity: 0, y: -10 }}
            animate={isMobile ? { y: 0 } : { opacity: 1, y: 0 }}
            exit={isMobile ? { y: "100%" } : { opacity: 0, y: -10 }}
            transition={
              isMobile
                ? { type: "spring", damping: 30, stiffness: 300, mass: 0.7 }
                : { duration: 0.2 }
            }
            className="fixed inset-0 z-50 overscroll-contain md:absolute md:inset-auto md:top-full md:right-0 md:left-0 md:z-0 md:border-b md:border-neutral-800/80 md:shadow-2xl"
          >
            <div className="absolute inset-0 bg-neutral-950 md:bg-neutral-950/95 md:backdrop-blur-xl" />

            <div className="relative h-full overflow-y-auto overscroll-contain md:h-auto md:overflow-visible">
              <div className="relative mx-auto min-h-full max-w-[1920px] px-4 py-6 sm:px-6 md:min-h-0">
                {/* Mobile sheet header */}
                <div className="mb-6 flex items-center justify-between border-b border-neutral-800 pb-4 pt-[env(safe-area-inset-top)] md:hidden">
                  <span className="flex items-center gap-2 text-lg font-bold text-white">
                    <SlidersHorizontal size={18} className="text-pink-500" /> Filters
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    aria-label="Close filters"
                    className="flex min-h-11 min-w-11 items-center justify-center rounded-full bg-neutral-900 text-neutral-400 hover:text-white"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="space-y-6 pb-[max(5rem,env(safe-area-inset-bottom))] md:pb-0">
                  <PresetRowSection state={state} dispatch={dispatch} />
                  <RangeSection state={state} dispatch={dispatch} />
                  <BottomSection state={state} dispatch={dispatch} />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Brand({ resultCount }: { resultCount: number }) {
  return (
    <div className="flex flex-col select-none">
      <h1 className="text-xl font-black tracking-tighter text-white italic">
        BANGUMI <span className="text-pink-500">EXPLORER</span>
      </h1>
      <div className="flex items-center gap-2 font-mono text-[9px] font-bold tracking-widest text-neutral-500 uppercase">
        <span>Database v3.0</span>
        <div className="h-1 w-1 rounded-full bg-neutral-700" />
        <span className={resultCount === 0 ? "text-red-500" : "text-neutral-400"}>
          {resultCount.toLocaleString()} Found
        </span>
      </div>
    </div>
  );
}

function SearchBox({
  value,
  onChange,
  placeholder,
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
        <Search
          className="text-neutral-600 transition-colors group-focus-within:text-pink-500"
          size={16}
        />
      </div>
      <input
        type="search"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="min-h-11 w-full rounded-full border border-neutral-800/80 bg-neutral-900/50 py-3 pr-4 pl-11 text-sm text-neutral-200 shadow-inner transition-colors placeholder:text-neutral-600 focus:border-pink-500/50 focus:bg-neutral-900 focus:outline-none [&::-webkit-search-cancel-button]:appearance-none"
      />
    </div>
  );
}

function PresetRowSection({
  state,
  dispatch,
}: {
  state: ExplorerState;
  dispatch: (action: ExplorerAction) => void;
}) {
  const epsEnabled = isEpsFilterApplicable(state.types);
  const [epsMin, epsMax] = state.filters.eps;
  const [, epsBoundMax] = RANGE_BOUNDS.eps;

  // The quick toggles are just views over the eps range.
  const shortSeries = epsMax === 52;
  const seriesOnly = epsMin === 2;

  return (
    <PresetRow
      state={state}
      onToggle={(preset) => dispatch({ kind: "preset-toggle", preset })}
      epsEnabled={epsEnabled}
      shortSeries={shortSeries}
      seriesOnly={seriesOnly}
      onToggleShortSeries={() =>
        dispatch({
          kind: "range-set",
          key: "eps",
          range: [epsMin, shortSeries ? epsBoundMax : 52],
        })
      }
      onToggleSeriesOnly={() =>
        dispatch({ kind: "range-set", key: "eps", range: [seriesOnly ? 0 : 2, epsMax] })
      }
    />
  );
}

const RANGE_FIELDS: { key: RangeKey; label: string; icon: React.ReactNode; step?: number }[] = [
  { key: "year", label: "Year", icon: <Calendar size={14} /> },
  { key: "score", label: "Score", icon: <Star size={14} />, step: 0.1 },
  { key: "rank", label: "Rank", icon: <Trophy size={14} /> },
  { key: "votes", label: "Votes", icon: <Users size={14} /> },
  { key: "eps", label: "Episodes", icon: <Layers size={14} /> },
];

function RangeSection({
  state,
  dispatch,
}: {
  state: ExplorerState;
  dispatch: (action: ExplorerAction) => void;
}) {
  const seasonMode = isSeasonApplicable(state.filters);

  return (
    <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-5">
      {RANGE_FIELDS.map((field) => {
        const [min, max] = state.filters[field.key];
        const [boundMin, boundMax] = RANGE_BOUNDS[field.key];
        const highlighted = field.key === "year" && seasonMode;
        const commit = (nextMin: number, nextMax: number) =>
          dispatch({ kind: "range-set", key: field.key, range: [nextMin, nextMax] });

        return (
          <div
            key={field.key}
            className={cn(
              "group relative flex flex-col gap-2 rounded-xl border p-3 transition-colors duration-300",
              highlighted
                ? "border-pink-500/30 bg-pink-900/5"
                : "border-neutral-800 bg-neutral-900/30 hover:border-neutral-700",
            )}
          >
            <div
              className={cn(
                "flex items-center gap-2 transition-colors",
                highlighted ? "text-pink-400" : "text-neutral-500 group-hover:text-neutral-400",
              )}
            >
              {field.icon}
              <span className="text-[10px] font-bold tracking-wider uppercase">{field.label}</span>
            </div>
            <div className="flex items-center gap-2">
              <NumberField
                value={min}
                min={boundMin}
                max={boundMax}
                step={field.step}
                aria-label={`${field.label} minimum`}
                onCommit={(v) => commit(Math.min(v, max), max)}
              />
              <span className="font-light text-neutral-700">/</span>
              <NumberField
                value={max}
                min={boundMin}
                max={boundMax}
                step={field.step}
                aria-label={`${field.label} maximum`}
                onCommit={(v) => commit(min, Math.max(v, min))}
              />
            </div>
            {highlighted && (
              <div className="pointer-events-none absolute inset-0 animate-pulse rounded-xl border border-pink-500/20" />
            )}
          </div>
        );
      })}
    </div>
  );
}

const SEASON_OPTIONS: {
  value: Season;
  label: string;
  icon: React.ReactNode;
  activeClass: string;
}[] = [
  {
    value: 1,
    label: "Winter",
    icon: <Snowflake size={14} />,
    activeClass: "bg-sky-500/20 text-sky-300 border-sky-500/50",
  },
  {
    value: 4,
    label: "Spring",
    icon: <Wind size={14} />,
    activeClass: "bg-emerald-500/20 text-emerald-300 border-emerald-500/50",
  },
  {
    value: 7,
    label: "Summer",
    icon: <Sun size={14} />,
    activeClass: "bg-orange-500/20 text-orange-300 border-orange-500/50",
  },
  {
    value: 10,
    label: "Fall",
    icon: <CloudRain size={14} />,
    activeClass: "bg-amber-500/20 text-amber-300 border-amber-500/50",
  },
];

const STATUS_OPTIONS: {
  value: StatusFilter;
  label: string;
  icon: React.ReactNode;
  activeClass: string;
}[] = [
  {
    value: "todo",
    label: "Todo",
    icon: <ListFilter size={12} />,
    activeClass: "border-white/70 bg-neutral-100 text-black shadow-lg shadow-white/10",
  },
  {
    value: "collected",
    label: "Saved",
    icon: <Check size={12} />,
    activeClass: "border-green-400/60 bg-green-500/20 text-green-200 shadow-lg shadow-green-500/10",
  },
  {
    value: "wishlist",
    label: "Wishlist",
    icon: <Bookmark size={12} />,
    activeClass: "border-blue-400/60 bg-blue-500/20 text-blue-200 shadow-lg shadow-blue-500/10",
  },
  {
    value: "ignored",
    label: "Ignored",
    icon: <Ban size={12} />,
    activeClass: "border-red-400/60 bg-red-500/20 text-red-200 shadow-lg shadow-red-500/10",
  },
  {
    value: "all",
    label: "All",
    icon: <Layers size={12} />,
    activeClass: "border-neutral-500 bg-neutral-800 text-white shadow-lg shadow-white/5",
  },
];

function BottomSection({
  state,
  dispatch,
}: {
  state: ExplorerState;
  dispatch: (action: ExplorerAction) => void;
}) {
  const showSeason = isSeasonApplicable(state.filters);

  return (
    <div className="flex flex-col gap-8 border-t border-neutral-800/50 pt-4 xl:flex-row">
      <div className="flex flex-col items-start gap-8 md:flex-row">
        {/* Format (type) toggles */}
        <div className="flex flex-col gap-3">
          <span className="pl-1 text-[10px] font-bold tracking-wider text-neutral-500 uppercase">
            Format
          </span>
          <div className="flex gap-2">
            {SUBJECT_TYPES.map((type) => (
              <button
                type="button"
                key={type}
                onClick={() => dispatch({ kind: "type-toggle", type })}
                aria-pressed={state.types.has(type)}
                className={cn(
                  "min-h-9 rounded-lg border px-4 py-1.5 text-[11px] font-bold transition-colors",
                  state.types.has(type)
                    ? "border-pink-500 bg-pink-600 text-white shadow-md shadow-pink-900/50"
                    : "border-neutral-800 bg-neutral-900 text-neutral-500 hover:border-neutral-700 hover:text-neutral-300",
                )}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Season selector, only when the year range pins a single year */}
        <AnimatePresence mode="popLayout">
          {showSeason && (
            <motion.div
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.16, ease: "easeOut" }}
              className="flex flex-col gap-3"
            >
              <span className="flex items-center gap-2 pl-1 text-[10px] font-bold tracking-wider text-neutral-500 uppercase">
                {state.filters.year[0]} Season
              </span>
              <div className="grid w-full grid-cols-4 gap-1 rounded-lg border border-neutral-800 bg-neutral-900/50 p-1 md:w-auto">
                {SEASON_OPTIONS.map((option) => {
                  const isActive = state.season === option.value;
                  return (
                    <button
                      type="button"
                      key={option.value}
                      onClick={() =>
                        dispatch({ kind: "season-set", season: isActive ? null : option.value })
                      }
                      aria-pressed={isActive}
                      className={cn(
                        "relative flex min-h-9 items-center justify-center gap-2 rounded-md border px-4 py-1.5 text-[11px] font-bold transition-colors",
                        isActive
                          ? option.activeClass
                          : "border-transparent text-neutral-500 hover:bg-neutral-800 hover:text-neutral-300",
                      )}
                    >
                      <span className={isActive ? "opacity-100" : "opacity-70"}>{option.icon}</span>
                      <span className="hidden lg:inline">{option.label}</span>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex items-end gap-3 xl:ml-auto">
        {/* Collection status tabs */}
        <div className="grid grid-cols-5 rounded-xl border border-neutral-800 bg-neutral-900 p-1 shadow-inner shadow-black/20">
          {STATUS_OPTIONS.map((option) => {
            const isActive = state.status === option.value;
            return (
              <button
                type="button"
                key={option.value}
                onClick={() => dispatch({ kind: "status-set", status: option.value })}
                aria-pressed={isActive}
                title={option.label}
                className={cn(
                  "flex min-h-9 min-w-0 items-center justify-center gap-2 rounded-lg border px-3 py-1.5 text-[10px] font-bold uppercase transition-colors md:min-w-[6.75rem]",
                  isActive
                    ? option.activeClass
                    : "border-transparent text-neutral-500 hover:text-neutral-300",
                )}
              >
                {option.icon} <span className="hidden md:inline">{option.label}</span>
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => dispatch({ kind: "reset" })}
          className="flex min-h-9 items-center gap-2 rounded-lg border border-transparent px-6 py-2 text-[11px] font-bold text-neutral-500 transition-colors hover:bg-red-900/10 hover:text-red-400"
        >
          <X size={14} /> Clear Filters
        </button>
      </div>
    </div>
  );
}
