"use client";

import {
  Ban,
  Bookmark,
  BookOpen,
  Check,
  Clapperboard,
  Clock,
  ExternalLink,
  Eye,
  Heart,
  Music,
  PauseCircle,
  Plus,
  User,
  Users,
  X,
} from "lucide-react";
import { motion } from "motion/react";
import Image from "next/image";
import { useEffect, useState } from "react";
import type { ItemStatus } from "@/features/collection/domain";
import { fetchSubjectDetail } from "@/shared/data/loaders";
import type { SiteRef, SubjectDetail, SubjectIndex } from "@/shared/data/subject";
import { cn } from "@/shared/ui/cn";
import { useModalBehavior } from "@/shared/ui/use-modal-behavior";

interface DetailModalProps {
  subject: SubjectIndex;
  status: ItemStatus | null;
  isAdmin: boolean;
  onClose: () => void;
  onUpdateStatus: (id: number, status: ItemStatus | null) => void;
}

function siteUrl(ref: SiteRef): string | null {
  switch (ref.site) {
    case "bangumi":
      return `https://bgm.tv/subject/${ref.id}`;
    case "bilibili":
      return `https://www.bilibili.com/bangumi/play/ss${ref.id}`;
    case "iqiyi":
      return `https://www.iqiyi.com/${ref.id}.html`;
    case "qq":
      return `https://v.qq.com/x/cover/${ref.id}.html`;
    case "nicovideo":
      return `https://ch.nicovideo.jp/${ref.id}`;
    case "netflix":
      return `https://www.netflix.com/title/${ref.id}`;
    default:
      return null;
  }
}

export function DetailModal({
  subject,
  status,
  isAdmin,
  onClose,
  onUpdateStatus,
}: DetailModalProps) {
  useModalBehavior(onClose);

  // Detail payload loads on demand; the index fields render immediately so
  // the modal never blocks on the network.
  const [detail, setDetail] = useState<SubjectDetail | null>(null);
  const [detailFailed, setDetailFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setDetail(null);
    setDetailFailed(false);
    fetchSubjectDetail(subject.id).then(
      (data) => {
        if (!cancelled) setDetail(data);
      },
      () => {
        if (!cancelled) setDetailFailed(true);
      },
    );
    return () => {
      cancelled = true;
    };
  }, [subject.id]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center md:p-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.22, ease: "easeOut" }}
        className="absolute inset-0 bg-black/90 backdrop-blur-sm"
        onClick={(e) => {
          // Only close when clicking the backdrop itself, not bubbled events.
          if (e.target === e.currentTarget) onClose();
        }}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.985 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.985 }}
        transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 flex h-dvh w-full flex-col overflow-hidden overscroll-contain border-0 border-neutral-800 bg-neutral-900 shadow-2xl md:h-auto md:max-h-[90vh] md:max-w-6xl md:flex-row md:rounded-xl md:border"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close details"
          className="absolute top-[max(1rem,env(safe-area-inset-top))] right-4 z-20 flex min-h-11 min-w-11 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-md transition-colors hover:bg-neutral-700"
        >
          <X size={20} />
        </button>

        {/* Sidebar: poster, actions, community stats, external links */}
        <div className="flex w-full shrink-0 flex-col gap-5 overflow-y-auto overscroll-contain border-b border-neutral-800 bg-neutral-950 p-4 md:w-[300px] md:gap-5 md:border-r md:border-b-0 md:p-5">
          <div className="flex items-end gap-4 md:hidden">
            <PosterFrame subject={subject} className="w-[118px]" sizes="118px" />
            <div className="min-w-0 flex-1 pb-1 pr-12">
              <h1 className="line-clamp-3 text-pretty text-xl leading-tight font-bold text-white">
                {subject.cn || subject.name}
              </h1>
              {subject.cn !== subject.name && (
                <p className="mt-1 line-clamp-1 text-xs text-neutral-500">{subject.name}</p>
              )}
              <div className="mt-4 flex items-end justify-between gap-3">
                <div>
                  <div className="font-mono text-3xl leading-none font-bold text-yellow-400">
                    {subject.score.toFixed(1)}
                  </div>
                  <div className="mt-1 font-mono text-[10px] text-neutral-500">
                    {subject.total.toLocaleString()} votes
                  </div>
                </div>
                {subject.rank > 0 && (
                  <div className="rounded border border-neutral-700 bg-neutral-900 px-2.5 py-1 font-mono text-xs text-neutral-300">
                    #{subject.rank}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="hidden md:block">
            <PosterFrame subject={subject} sizes="300px" />
          </div>

          {isAdmin ? (
            <AdminStatusActions
              status={status}
              onUpdate={(next) => onUpdateStatus(subject.id, next)}
            />
          ) : (
            status && <GuestStatusBadge status={status} />
          )}

          <CommunityStats detail={detail} failed={detailFailed} />

          <VisitSection detail={detail} failed={detailFailed} className="md:mt-auto" />
        </div>

        {/* Main content: title, score chart, synopsis, tags, staff */}
        <div className="flex-1 overflow-y-auto overscroll-contain bg-neutral-900/50">
          <div className="space-y-8 p-6 pb-[max(6rem,env(safe-area-inset-bottom))] md:p-10 md:pb-10">
            <div className="hidden md:block">
              <div className="mb-4 flex flex-wrap items-center gap-3">
                <Badge className="bg-purple-500/10 text-purple-400">{subject.type}</Badge>
                {subject.year > 0 && (
                  <Badge className="bg-neutral-800 text-neutral-400">{subject.year}</Badge>
                )}
                {subject.eps > 0 && (
                  <Badge className="bg-neutral-800 text-neutral-400">{subject.eps} Episodes</Badge>
                )}
                {subject.studio && (
                  <Badge className="bg-blue-500/10 text-blue-400">
                    <Clapperboard size={10} /> {subject.studio.split(/,|，/)[0]}
                  </Badge>
                )}
              </div>
              <h1 className="mb-2 text-3xl leading-tight font-bold text-white md:text-4xl">
                {subject.cn || subject.name}
              </h1>
              {subject.cn !== subject.name && (
                <h2 className="text-lg font-medium text-neutral-500 md:text-xl">{subject.name}</h2>
              )}
            </div>

            <div className="hidden md:block">
              <ScorePanel subject={subject} detail={detail} />
            </div>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
              <div className="space-y-6 lg:col-span-2">
                <section className={cn(detail && "animate-detail-in")}>
                  <SectionTitle>Synopsis</SectionTitle>
                  <p className="text-justify text-sm leading-7 whitespace-pre-line text-neutral-300">
                    {detail
                      ? detail.summary || "No summary available."
                      : detailFailed
                        ? "Failed to load details."
                        : "Loading…"}
                  </p>
                </section>
                {detail && detail.tags.length > 0 && (
                  <section className="animate-detail-in">
                    <SectionTitle>Tags</SectionTitle>
                    <div className="flex flex-wrap gap-2">
                      {detail.tags.map((tag) => (
                        <span
                          key={tag}
                          className="cursor-default rounded border border-neutral-700/50 bg-neutral-800 px-2.5 py-1 text-xs text-neutral-400 transition-colors hover:text-white"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </section>
                )}
              </div>

              <div className={cn("space-y-6", detail && "animate-detail-in")}>
                <SectionTitle>Production Staff</SectionTitle>
                <div className="grid grid-cols-2 gap-4 md:grid-cols-1 md:gap-0 md:space-y-4">
                  <StaffRow label="Director" value={subject.director} icon={<Users size={14} />} />
                  <StaffRow label="Script" value={subject.writer} icon={<BookOpen size={14} />} />
                  <StaffRow
                    label="Original"
                    value={detail?.original ?? ""}
                    icon={<Clapperboard size={14} />}
                  />
                  <StaffRow
                    label="Character"
                    value={detail?.charDesign ?? ""}
                    icon={<User size={14} />}
                  />
                  <StaffRow label="Music" value={detail?.music ?? ""} icon={<Music size={14} />} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function PosterFrame({
  subject,
  className,
  sizes,
}: {
  subject: SubjectIndex;
  className?: string;
  sizes: string;
}) {
  return (
    <div
      className={cn(
        "relative mx-auto aspect-[2/3] shrink-0 overflow-hidden rounded-lg border border-neutral-800 bg-neutral-900 shadow-2xl",
        className ?? "w-full",
      )}
    >
      {subject.img ? (
        <Image
          src={subject.img.replace("http://", "https://")}
          alt={subject.name}
          fill
          sizes={sizes}
          className="object-cover"
          unoptimized
        />
      ) : (
        <div className="flex h-full items-center justify-center text-neutral-800">No Image</div>
      )}
    </div>
  );
}

function VisitSection({
  detail,
  failed,
  className,
}: {
  detail: SubjectDetail | null;
  failed: boolean;
  className?: string;
}) {
  const links =
    detail?.sites.flatMap((ref) => {
      const url = siteUrl(ref);
      return url ? [{ ref, url }] : [];
    }) ?? [];

  if ((detail || failed) && links.length === 0) return null;

  return (
    <div className={cn("min-h-[76px] space-y-2", className)}>
      <h4 className="text-[10px] font-bold tracking-wider text-neutral-500 uppercase">Visit</h4>
      <div className="flex flex-wrap gap-2">
        {detail
          ? links.map(({ ref, url }) => (
              <a
                key={ref.site}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex min-h-9 items-center gap-1.5 rounded border border-neutral-800 bg-neutral-900 px-3 py-1.5 text-xs text-neutral-300 capitalize transition-colors hover:border-neutral-600"
              >
                <ExternalLink size={10} /> {ref.site}
              </a>
            ))
          : VISIT_PLACEHOLDERS.map((key) => (
              <span
                key={key}
                aria-hidden="true"
                className="h-9 w-24 rounded border border-neutral-800 bg-neutral-900/70 opacity-60"
              />
            ))}
      </div>
    </div>
  );
}

function ScorePanel({ subject, detail }: { subject: SubjectIndex; detail: SubjectDetail | null }) {
  const chart = detail?.scoreChart ?? {};
  const maxVotes = Math.max(...Object.values(chart), 1);

  return (
    <div className="flex flex-col gap-8 rounded-xl border border-neutral-800/50 bg-black/20 p-4 md:flex-row md:p-6">
      <div className="flex w-full min-w-[120px] flex-row items-center justify-between gap-4 md:w-auto md:flex-col md:items-start md:justify-center">
        <div className="flex flex-col items-center md:items-start">
          <div className="font-mono text-4xl font-bold tracking-tighter text-yellow-400 md:text-5xl">
            {subject.score.toFixed(1)}
          </div>
          <div className="mt-1 font-mono text-[10px] text-neutral-500 md:text-xs">
            {subject.total.toLocaleString()} votes
          </div>
        </div>
        <div className="rounded border border-neutral-700 bg-neutral-800 px-3 py-1 text-center font-mono text-xs text-neutral-300 md:mt-4">
          Rank #{subject.rank}
        </div>
      </div>

      {/* Distribution chart is desktop-only (tooltips are hover-driven). */}
      <div className="hidden h-32 flex-1 items-end gap-1 border-b border-neutral-800 pb-1 md:flex">
        {Array.from({ length: 10 }, (_, i) => i + 1).map((score) => {
          const count = chart[score.toString()] ?? 0;
          const height = (count / maxVotes) * 100;
          return (
            <div
              key={score}
              className="group relative flex h-full flex-1 flex-col items-center justify-end"
            >
              <div className="flex h-full w-full items-end rounded-t-sm bg-neutral-800/30">
                <div
                  className={cn(
                    "w-full rounded-t-sm transition-[height,background-color] duration-500",
                    score >= 8 ? "bg-yellow-500" : score >= 6 ? "bg-neutral-500" : "bg-neutral-700",
                  )}
                  style={{ height: `${Math.max(height, 2)}%` }}
                />
              </div>
              <div className="mt-2 font-mono text-[10px] text-neutral-600">{score}</div>
              <div className="pointer-events-none absolute -top-8 left-1/2 z-10 -translate-x-1/2 rounded border border-neutral-700 bg-neutral-800 px-2 py-1 font-mono text-xs whitespace-nowrap text-white opacity-0 transition-opacity group-hover:opacity-100">
                {count}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function AdminStatusActions({
  status,
  onUpdate,
}: {
  status: ItemStatus | null;
  onUpdate: (status: ItemStatus | null) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={() => onUpdate(status === "collected" ? null : "collected")}
        className={cn(
          "flex min-h-12 w-full items-center justify-center gap-2 rounded-md text-sm font-bold tracking-wide transition-colors",
          status === "collected"
            ? "bg-green-600 text-white shadow-lg shadow-green-900/20 hover:bg-green-500"
            : "bg-white text-black hover:bg-neutral-200",
        )}
      >
        {status === "collected" ? (
          <>
            <Check size={18} /> SAVED
          </>
        ) : (
          <>
            <Plus size={18} /> COLLECT
          </>
        )}
      </button>

      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => onUpdate(status === "wishlist" ? null : "wishlist")}
          className={cn(
            "flex min-h-11 items-center justify-center gap-1.5 rounded-md border text-xs font-bold transition-colors",
            status === "wishlist"
              ? "border-blue-500 bg-blue-600 text-white"
              : "border-neutral-800 bg-neutral-900 text-neutral-400 hover:border-neutral-600 hover:text-white",
          )}
        >
          <Bookmark size={14} /> Wishlist
        </button>
        <button
          type="button"
          onClick={() => onUpdate(status === "ignored" ? null : "ignored")}
          className={cn(
            "flex min-h-11 items-center justify-center gap-1.5 rounded-md border text-xs font-bold transition-colors",
            status === "ignored"
              ? "border-red-500 bg-red-900/50 text-red-200"
              : "border-neutral-800 bg-neutral-900 text-neutral-400 hover:border-neutral-600 hover:text-white",
          )}
        >
          <Ban size={14} /> Ignore
        </button>
      </div>
    </div>
  );
}

const GUEST_BADGES: Record<
  ItemStatus,
  { label: string; icon: React.ReactNode; className: string }
> = {
  collected: {
    label: "Collected",
    icon: <Check size={16} />,
    className: "bg-green-900/20 text-green-400 border-green-900",
  },
  wishlist: {
    label: "Wishlist",
    icon: <Bookmark size={16} />,
    className: "bg-blue-900/20 text-blue-400 border-blue-900",
  },
  ignored: {
    label: "Ignored",
    icon: <Ban size={16} />,
    className: "bg-red-900/20 text-red-400 border-red-900",
  },
};

function GuestStatusBadge({ status }: { status: ItemStatus }) {
  const badge = GUEST_BADGES[status];
  return (
    <div
      className={cn(
        "flex w-full cursor-default items-center justify-center gap-2 rounded-md border py-3 text-sm font-bold tracking-wide select-none",
        badge.className,
      )}
    >
      {badge.icon} {badge.label}
    </div>
  );
}

const COMMUNITY_ROWS = [
  { key: "collect", label: "Watched", icon: <Eye size={14} />, color: "text-blue-400" },
  { key: "wish", label: "Wish", icon: <Heart size={14} />, color: "text-pink-400" },
  { key: "doing", label: "Doing", icon: <Clock size={14} />, color: "text-yellow-400" },
  { key: "onHold", label: "On Hold", icon: <PauseCircle size={14} />, color: "text-neutral-400" },
] as const;

const VISIT_PLACEHOLDERS = ["primary", "secondary"] as const;

function CommunityStats({ detail, failed }: { detail: SubjectDetail | null; failed: boolean }) {
  return (
    <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-3">
      <h4 className="mb-3 text-[10px] font-bold tracking-wider text-neutral-500 uppercase">
        Community Stats
      </h4>
      <div className="grid grid-cols-2 gap-2 md:block md:space-y-3">
        {COMMUNITY_ROWS.map((row) => (
          <div
            key={row.key}
            className="group flex flex-col gap-1 rounded-md border border-neutral-800/70 bg-neutral-950/30 p-2 md:flex-row md:items-center md:justify-between md:border-0 md:bg-transparent md:p-0"
          >
            <div className="flex items-center gap-2 text-neutral-500 transition-colors group-hover:text-neutral-300 md:gap-3">
              {row.icon} <span className="text-xs font-medium">{row.label}</span>
            </div>
            <span
              className={cn(
                "font-mono text-base leading-none font-bold transition-opacity duration-300 md:text-sm",
                row.color,
                detail ? "opacity-100" : "opacity-50",
              )}
            >
              {detail ? detail.collection[row.key].toLocaleString() : failed ? "-" : "…"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="mb-3 text-xs font-bold tracking-wider text-neutral-500 uppercase">{children}</h3>
  );
}

function Badge({ className, children }: { className: string; children: React.ReactNode }) {
  return (
    <div
      className={cn(
        "flex items-center gap-1.5 rounded border border-transparent px-2 py-1 text-[10px] font-bold tracking-wider uppercase",
        className,
      )}
    >
      {children}
    </div>
  );
}

function StaffRow({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  if (!value) return null;
  return (
    <div className="group">
      <div className="mb-1 flex items-center gap-2 text-neutral-500">
        {icon} <span className="text-[10px] font-bold uppercase">{label}</span>
      </div>
      <div className="border-l-2 border-neutral-800 pl-6 text-sm text-neutral-200 transition-colors group-hover:border-pink-500/50">
        {value}
      </div>
    </div>
  );
}
