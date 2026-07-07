"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/shared/ui/cn";

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="mt-16 flex flex-col items-center justify-center gap-6 sm:flex-row">
      <div className="flex items-center gap-4">
        <button
          type="button"
          disabled={page === 1}
          onClick={() => onPageChange(page - 1)}
          aria-label="Previous page"
          className="flex min-h-12 min-w-12 items-center justify-center rounded-full border border-neutral-800 bg-neutral-900 text-white transition-colors hover:border-pink-500 disabled:opacity-20"
        >
          <ChevronLeft size={20} />
        </button>

        <div className="flex min-w-[100px] items-center justify-center gap-2">
          <span className="text-xs font-bold tracking-widest text-neutral-500 uppercase">Page</span>
          <span className="font-mono text-lg font-bold text-white">{page}</span>
          <span className="text-xs font-bold tracking-widest text-neutral-500 uppercase">
            of {totalPages}
          </span>
        </div>

        <button
          type="button"
          disabled={page === totalPages}
          onClick={() => onPageChange(page + 1)}
          aria-label="Next page"
          className="flex min-h-12 min-w-12 items-center justify-center rounded-full border border-neutral-800 bg-neutral-900 text-white transition-colors hover:border-pink-500 disabled:opacity-20"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          const input = (event.target as HTMLFormElement).elements.namedItem(
            "page",
          ) as HTMLInputElement;
          const value = Number.parseInt(input.value, 10);
          if (Number.isNaN(value)) return;
          onPageChange(Math.min(Math.max(value, 1), totalPages));
          input.value = "";
        }}
        className="flex items-center gap-2 border-neutral-800 sm:border-l sm:pl-6"
      >
        <span className="text-[10px] font-bold tracking-widest text-neutral-500 uppercase">
          Go to
        </span>
        <input
          name="page"
          type="number"
          inputMode="numeric"
          min={1}
          max={totalPages}
          placeholder="#"
          aria-label="Jump to page"
          className={cn(
            "min-h-10 w-14 rounded border border-neutral-800 bg-neutral-900 px-2 py-1.5 text-center font-mono text-xs text-white",
            "placeholder:text-neutral-700 focus:border-pink-500 focus:outline-none",
            "[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none",
          )}
        />
        <button
          type="submit"
          aria-label="Go to page"
          className="flex min-h-10 min-w-10 items-center justify-center rounded bg-neutral-800 text-neutral-400 transition-colors hover:bg-neutral-700 hover:text-white"
        >
          <ChevronRight size={14} />
        </button>
      </form>
    </div>
  );
}
