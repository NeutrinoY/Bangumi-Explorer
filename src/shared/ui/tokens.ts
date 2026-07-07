import type { ItemStatus } from "@/features/collection/domain";

/**
 * Shared visual vocabulary: colors that carry meaning across components.
 * Keeping them here means a card badge and a detail-modal button can never
 * disagree about what "collected" looks like.
 */

/** Bangumi's strict score color tiers. */
export function scoreColorClass(score: number): string {
  if (score >= 9.0) return "text-[#FFD700]"; // gold
  if (score >= 8.5) return "text-[#FF4500]"; // orange red
  if (score >= 8.0) return "text-[#FF69B4]"; // hot pink
  if (score >= 7.5) return "text-[#32CD32]"; // lime green
  if (score >= 7.0) return "text-[#00CED1]"; // dark turquoise
  if (score >= 6.0) return "text-[#A9A9A9]"; // dark gray
  return "text-[#696969]"; // dim gray
}

/** Rank badge tiers: top 100 gold, top 500 white, the rest translucent black. */
export function rankBadgeClass(rank: number): string {
  if (rank <= 100) return "bg-yellow-500/90 text-black border-yellow-400";
  if (rank <= 500) return "bg-white/90 text-black border-white";
  return "bg-black/60 text-white border-white/10";
}

/** Solid indicator style per collection status (card corner badge). */
export const STATUS_INDICATOR_CLASS: Record<ItemStatus, string> = {
  collected: "bg-green-500 border-green-400 text-white",
  wishlist: "bg-blue-500 border-blue-400 text-white",
  ignored: "bg-red-500 border-red-400 text-white",
};
