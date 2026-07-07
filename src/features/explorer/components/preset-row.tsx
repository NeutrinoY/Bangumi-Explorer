"use client";

import { Clapperboard, Film, Flame, Gem, Hourglass, Layers, Zap } from "lucide-react";
import type { Preset, PresetId } from "@/features/explorer/domain/presets";
import { isPresetActive, PRESETS } from "@/features/explorer/domain/presets";
import type { ExplorerState } from "@/features/explorer/domain/state";
import { cn } from "@/shared/ui/cn";

/** Per-preset look: icon + idle/active color treatments. */
const PRESET_STYLE: Record<PresetId, { icon: React.ReactNode; idle: string; active: string }> = {
  "modern-hits": {
    icon: <Flame size={12} />,
    idle: "text-orange-400 border-orange-500/30 hover:bg-orange-500/10",
    active: "bg-orange-500 text-white border-orange-500",
  },
  "modern-gems": {
    icon: <Gem size={12} />,
    idle: "text-purple-400 border-purple-500/30 hover:bg-purple-500/10",
    active: "bg-purple-500 text-white border-purple-500",
  },
  "retro-classics": {
    icon: <Hourglass size={12} />,
    idle: "text-yellow-400 border-yellow-500/30 hover:bg-yellow-500/10",
    active: "bg-yellow-500 text-black border-yellow-500",
  },
  "retro-cult": {
    icon: <Zap size={12} />,
    idle: "text-cyan-400 border-cyan-500/30 hover:bg-cyan-500/10",
    active: "bg-cyan-500 text-black border-cyan-500",
  },
  "movie-hits": {
    icon: <Clapperboard size={12} />,
    idle: "text-red-400 border-red-500/30 hover:bg-red-500/10",
    active: "bg-red-500 text-white border-red-500",
  },
  "movie-gems": {
    icon: <Film size={12} />,
    idle: "text-rose-300 border-rose-400/30 hover:bg-rose-400/10",
    active: "bg-rose-400 text-white border-rose-400",
  },
};

interface PresetRowProps {
  state: ExplorerState;
  onToggle: (preset: Preset) => void;
  /** Episode quick toggles, derived from the eps range. */
  epsEnabled: boolean;
  shortSeries: boolean;
  seriesOnly: boolean;
  onToggleShortSeries: () => void;
  onToggleSeriesOnly: () => void;
}

export function PresetRow({
  state,
  onToggle,
  epsEnabled,
  shortSeries,
  seriesOnly,
  onToggleShortSeries,
  onToggleSeriesOnly,
}: PresetRowProps) {
  return (
    <div className="flex flex-col items-center justify-between gap-4 border-b border-neutral-800/50 pb-4 xl:flex-row">
      <div className="grid w-full grid-cols-2 gap-2 md:flex md:w-auto md:flex-wrap md:justify-start">
        <div className="col-span-2 flex justify-center md:w-auto md:justify-start">
          <span className="mr-2 py-1.5 text-[10px] font-bold tracking-wider text-neutral-500 uppercase">
            Presets
          </span>
        </div>
        {PRESETS.map((preset) => {
          const style = PRESET_STYLE[preset.id];
          const active = isPresetActive(preset, state);
          return (
            <button
              type="button"
              key={preset.id}
              onClick={() => onToggle(preset)}
              aria-pressed={active}
              className={cn(
                "flex min-h-9 items-center justify-center gap-2 rounded-lg border px-3 py-1.5 text-[11px] font-bold transition-all",
                active ? style.active : cn("border-neutral-800 bg-neutral-900/50", style.idle),
              )}
            >
              {style.icon}
              <span>{preset.label}</span>
            </button>
          );
        })}
      </div>

      <div
        className={cn(
          "grid w-full grid-cols-2 gap-2 transition-opacity duration-300 md:flex md:w-auto md:items-center",
          !epsEnabled && "pointer-events-none opacity-30",
        )}
      >
        <button
          type="button"
          onClick={onToggleShortSeries}
          disabled={!epsEnabled}
          aria-pressed={shortSeries}
          className={cn(
            "flex min-h-9 items-center justify-center gap-2 rounded-lg border px-4 py-1.5 text-[11px] font-bold transition-all",
            shortSeries
              ? "border-indigo-500/50 bg-indigo-500/20 text-indigo-300"
              : "border-neutral-800 bg-neutral-900/50 text-neutral-500 hover:border-neutral-700",
          )}
        >
          <Zap size={12} className={shortSeries ? "text-indigo-400" : "text-neutral-600"} />
          Max 52 Eps
        </button>
        <button
          type="button"
          onClick={onToggleSeriesOnly}
          disabled={!epsEnabled}
          aria-pressed={seriesOnly}
          className={cn(
            "flex min-h-9 items-center justify-center gap-2 rounded-lg border px-4 py-1.5 text-[11px] font-bold transition-all",
            seriesOnly
              ? "border-teal-500/50 bg-teal-500/20 text-teal-300"
              : "border-neutral-800 bg-neutral-900/50 text-neutral-500 hover:border-neutral-700",
          )}
        >
          <Layers size={12} className={seriesOnly ? "text-teal-400" : "text-neutral-600"} />
          {">"} 1 Ep
        </button>
      </div>
    </div>
  );
}
