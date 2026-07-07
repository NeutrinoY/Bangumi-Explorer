"use client";

import { Ban, Bookmark, Check, X } from "lucide-react";
import Image from "next/image";
import type { ItemStatus } from "@/features/collection/domain";
import type { SubjectIndex } from "@/shared/data/subject";
import { cn } from "@/shared/ui/cn";
import { rankBadgeClass, STATUS_INDICATOR_CLASS, scoreColorClass } from "@/shared/ui/tokens";

interface AnimeCardProps {
  subject: SubjectIndex;
  status: ItemStatus | null;
  isAdmin: boolean;
  onOpen: () => void;
  onUpdateStatus: (id: number, status: ItemStatus | null) => void;
  /** Above-the-fold cards get eager image loading. */
  priority?: boolean;
}

const STATUS_ICONS: Record<ItemStatus, React.ReactNode> = {
  collected: <Check size={12} strokeWidth={4} />,
  wishlist: <Bookmark size={12} fill="currentColor" />,
  ignored: <X size={12} strokeWidth={4} />,
};

export function AnimeCard({
  subject,
  status,
  isAdmin,
  onOpen,
  onUpdateStatus,
  priority = false,
}: AnimeCardProps) {
  const ignored = status === "ignored";

  return (
    // The card body opens the detail view; admin action buttons live inside,
    // so the wrapper is a focusable div rather than a (non-nestable) button.
    // biome-ignore lint/a11y/useSemanticElements: nested interactive elements
    <div
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onOpen();
        }
      }}
      className={cn(
        "group relative flex h-full cursor-pointer flex-col overflow-hidden rounded-lg border transition-all duration-200",
        "border-neutral-800 bg-neutral-900",
        status === "collected" && "border-green-500/50 bg-green-950/20",
        status === "wishlist" && "border-blue-500/50 bg-blue-950/20",
        // Ignored cards fade out; admins can inspect them via hover/focus.
        ignored && "opacity-40",
        ignored && isAdmin && "transition-opacity hover:opacity-100 focus-within:opacity-100",
      )}
    >
      <div className="relative aspect-[3/4] w-full shrink-0 overflow-hidden bg-neutral-950">
        {subject.img ? (
          <Image
            src={subject.img.replace("http://", "https://")}
            alt={subject.name}
            fill
            priority={priority}
            className={cn(
              "object-cover transition-transform duration-500 group-hover:scale-105",
              ignored && "grayscale",
            )}
            sizes="(max-width: 768px) 50vw, 20vw"
            unoptimized
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-neutral-800 uppercase">
            No Image
          </div>
        )}

        {subject.rank > 0 && (
          <div
            className={cn(
              "absolute top-2 left-2 z-10 rounded-md border px-2.5 py-1 font-mono text-sm font-bold shadow-md backdrop-blur-md",
              rankBadgeClass(subject.rank),
            )}
          >
            #{subject.rank}
          </div>
        )}

        {isAdmin && (
          <AdminActionBar status={status} onUpdate={(next) => onUpdateStatus(subject.id, next)} />
        )}

        {status && (
          <div
            className={cn(
              "absolute top-2 right-2 z-10 rounded-full border p-1.5 shadow-md",
              STATUS_INDICATOR_CLASS[status],
            )}
          >
            {STATUS_ICONS[status]}
          </div>
        )}

        {!isAdmin && (
          <div className="absolute right-1 bottom-1 rounded border border-white/10 bg-black/80 px-1.5 py-0.5 text-[10px] font-bold tracking-wider text-neutral-300 uppercase backdrop-blur">
            {subject.type}
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-3">
        <div className="min-w-0">
          <h3
            className={cn(
              "line-clamp-1 text-sm leading-snug font-bold transition-colors",
              ignored ? "text-neutral-500" : "text-neutral-100",
            )}
            title={subject.cn || subject.name}
          >
            {subject.cn || subject.name}
          </h3>
          <p
            className="mt-0.5 truncate font-mono text-[10px] text-neutral-500"
            title={subject.name}
          >
            {subject.name}
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-[11px] leading-none text-neutral-400">
          <span className="font-bold">{subject.year || "----"}</span>
          <span className="text-neutral-700">|</span>
          <span>{subject.eps ? `${subject.eps} ep` : "?"}</span>
        </div>

        <div className="my-0.5 h-px bg-neutral-800/80" />

        <div className="mt-auto flex items-end justify-between">
          <div className="flex flex-col">
            <span className="mb-0.5 text-[9px] font-bold tracking-wider text-neutral-600 uppercase">
              Score
            </span>
            <span
              className={cn(
                "font-mono text-2xl leading-none font-bold tracking-tight",
                ignored ? "text-neutral-600" : scoreColorClass(subject.score),
              )}
            >
              {subject.score.toFixed(1)}
            </span>
          </div>
          <div className="flex flex-col items-end">
            <span className="mb-0.5 text-[9px] font-bold tracking-wider text-neutral-600 uppercase">
              Votes
            </span>
            <span className="font-mono text-xs font-medium text-neutral-300 tabular-nums">
              {subject.total.toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

const ADMIN_ACTIONS: {
  status: ItemStatus;
  label: string;
  icon: React.ReactNode;
  active: string;
  hover: string;
}[] = [
  {
    status: "ignored",
    label: "Ignore",
    icon: <Ban size={18} />,
    active: "bg-red-600 border-red-500 text-white",
    hover: "hover:bg-red-900/80 hover:border-red-500",
  },
  {
    status: "wishlist",
    label: "Wishlist",
    icon: <Bookmark size={18} />,
    active: "bg-blue-600 border-blue-500 text-white",
    hover: "hover:bg-blue-900/80 hover:border-blue-500",
  },
  {
    status: "collected",
    label: "Collect",
    icon: <Check size={18} />,
    active: "bg-green-600 border-green-500 text-white",
    hover: "hover:bg-green-900/80 hover:border-green-500",
  },
];

function AdminActionBar({
  status,
  onUpdate,
}: {
  status: ItemStatus | null;
  onUpdate: (status: ItemStatus | null) => void;
}) {
  return (
    <div className="absolute inset-x-0 bottom-0 z-20 flex items-center justify-between gap-2 bg-gradient-to-t from-black via-black/90 to-transparent p-2.5 sm:gap-3 sm:p-3">
      {ADMIN_ACTIONS.map((action) => (
        <button
          type="button"
          key={action.status}
          title={action.label}
          aria-label={action.label}
          aria-pressed={status === action.status}
          onClick={(event) => {
            event.stopPropagation();
            // Clicking the active status clears it (back to todo).
            onUpdate(status === action.status ? null : action.status);
          }}
          className={cn(
            "flex min-h-11 flex-1 items-center justify-center rounded-md border backdrop-blur-md transition-all",
            status === action.status
              ? action.active
              : cn(
                  "border-white/10 bg-neutral-900/80 text-neutral-400 hover:text-white",
                  action.hover,
                ),
          )}
        >
          {action.icon}
        </button>
      ))}
    </div>
  );
}
