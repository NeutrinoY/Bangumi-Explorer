"use client";

import Image from "next/image";
import { Check, Plus } from "lucide-react";
import type { BangumiSubject } from "@/hooks/useBangumiData";

interface AnimeRowProps {
  item: BangumiSubject;
  isCollected: boolean;
  onToggle: (id: number) => void;
}

export function AnimeRow({ item, isCollected, onToggle }: AnimeRowProps) {
  return (
    <div
      className={`group flex items-center gap-4 p-2 border-b border-neutral-800 hover:bg-neutral-800/50 transition-colors ${
        isCollected ? "bg-green-900/10" : ""
      }`}
    >
      {/* 1. Action (Collect) */}
      <button
        onClick={() => onToggle(item.id)}
        className={`w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-md border transition-all ${
          isCollected
            ? "bg-green-500 border-green-500 text-white"
            : "border-neutral-700 text-neutral-600 hover:border-pink-500 hover:text-pink-500"
        }`}
      >
        {isCollected ? <Check size={16} /> : <Plus size={16} />}
      </button>

      {/* 2. Thumbnail */}
      <div className="relative w-12 h-16 flex-shrink-0 bg-neutral-900 rounded overflow-hidden">
        {item.img && (
          <Image
            src={item.img.replace("http://", "https://")}
            alt={item.name}
            fill
            className="object-cover"
            sizes="48px"
            unoptimized
          />
        )}
        {/* Hover Preview (Portal-like absolute positioning needed in real app, simplified here) */}
        <div className="absolute left-14 top-0 w-48 h-72 z-50 hidden group-hover:block rounded-lg overflow-hidden shadow-2xl border border-neutral-700 pointer-events-none">
           {item.img && (
            <Image
              src={item.img.replace("http://", "https://")}
              alt={item.name}
              fill
              className="object-cover"
              unoptimized
            />
          )}
        </div>
      </div>

      {/* 3. Names */}
      <div className="flex-1 min-w-0 flex flex-col justify-center">
        <div className="flex items-baseline gap-2">
          <h3 className="text-sm font-bold text-neutral-200 truncate" title={item.cn || item.name}>
            {item.cn || item.name}
          </h3>
          <span className="text-xs text-neutral-500 truncate font-mono" title={item.id.toString()}>
            #{item.id}
          </span>
        </div>
        <div className="text-xs text-neutral-500 truncate font-mono" title={item.name}>
          {item.name}
        </div>
      </div>

      {/* 4. Meta Info (Year, Type, Eps) */}
      <div className="w-32 flex-shrink-0 flex flex-col justify-center text-right border-r border-neutral-800 pr-4">
        <span className="text-xs font-bold text-neutral-300">{item.year || '----'}</span>
        <div className="flex justify-end gap-2 text-[10px] text-neutral-500 font-mono">
          <span>{item.type}</span>
          <span>{item.eps ? `${item.eps}ep` : '?'}</span>
        </div>
      </div>

      {/* 5. Metrics (Score, Rank, Votes) */}
      <div className="w-32 flex-shrink-0 flex flex-col justify-center text-right border-r border-neutral-800 pr-4">
        <div className="flex items-center justify-end gap-1">
          <span className={`text-sm font-bold font-mono ${item.score >= 8 ? 'text-yellow-400' : 'text-neutral-300'}`}>
            {item.score.toFixed(1)}
          </span>
          <span className="text-[10px] text-neutral-600">sc</span>
        </div>
        <div className="flex justify-end gap-2 text-[10px] text-neutral-500 font-mono">
          <span title="Rank">#{item.rank || '-'}</span>
          <span title="Votes">({item.total})</span>
        </div>
      </div>

      {/* 6. Studio & Tags */}
      <div className="w-48 flex-shrink-0 hidden xl:flex flex-col justify-center gap-1">
        <div className="text-xs text-neutral-300 truncate" title={item.studio}>
          {item.studio || <span className="text-neutral-600 italic">Unknown Studio</span>}
        </div>
        <div className="flex flex-wrap gap-1 overflow-hidden h-4">
          {item.tags.slice(0, 3).map(tag => (
            <span key={tag} className="text-[10px] px-1 bg-neutral-800 rounded text-neutral-500">
              {tag}
            </span>
          ))}
        </div>
      </div>

    </div>
  );
}
