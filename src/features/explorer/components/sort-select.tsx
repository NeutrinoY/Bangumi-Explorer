"use client";

import { Check, ChevronDown } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import type { SortKey } from "@/features/explorer/domain/state";
import { cn } from "@/shared/ui/cn";
import { useClickOutside } from "@/shared/ui/use-click-outside";

const SORT_OPTIONS: { label: string; value: SortKey }[] = [
  { label: "Rank", value: "rank" },
  { label: "Score", value: "score" },
  { label: "Date", value: "date" },
  { label: "Popularity", value: "collected" },
];

export function SortSelect({
  value,
  onChange,
}: {
  value: SortKey;
  onChange: (v: SortKey) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useClickOutside<HTMLDivElement>(open, () => setOpen(false));

  const currentLabel = SORT_OPTIONS.find((o) => o.value === value)?.label;

  return (
    <div className="relative z-50 flex items-center gap-3" ref={ref}>
      <span className="text-[10px] font-bold tracking-wider text-neutral-500 uppercase">
        Sort By
      </span>
      <div className="relative w-[140px]">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          aria-haspopup="listbox"
          aria-expanded={open}
          className={cn(
            "flex min-h-9 w-full items-center justify-between rounded-lg border px-3 py-2 text-xs font-bold transition-colors",
            open
              ? "border-neutral-700 bg-neutral-800 text-white"
              : "border-neutral-800 bg-neutral-900/50 text-neutral-300 hover:border-neutral-700",
          )}
        >
          <span>{currentLabel}</span>
          <ChevronDown
            size={12}
            className={cn("transition-transform duration-200", open && "rotate-180")}
          />
        </button>

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: 2, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 2, scale: 0.98 }}
              transition={{ duration: 0.1 }}
              className="absolute top-full right-0 left-0 z-50 mt-1 overflow-hidden rounded-lg border border-neutral-800 bg-neutral-900 py-1 shadow-xl"
            >
              {SORT_OPTIONS.map((option) => (
                <button
                  type="button"
                  key={option.value}
                  onClick={() => {
                    onChange(option.value);
                    setOpen(false);
                  }}
                  className={cn(
                    "flex min-h-10 w-full items-center justify-between px-3 py-2 text-left text-xs font-bold transition-colors",
                    value === option.value
                      ? "bg-pink-500/10 text-pink-500"
                      : "text-neutral-400 hover:bg-neutral-800 hover:text-white",
                  )}
                >
                  {option.label}
                  {value === option.value && <Check size={12} />}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
