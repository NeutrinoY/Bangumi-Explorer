"use client";

import Image from "next/image";
import { Check, Plus, Star, Trophy } from "lucide-react";
import type { BangumiSubject } from "@/hooks/useBangumiData";

interface AnimeCardProps {
  item: BangumiSubject;
  isCollected: boolean;
  onToggle: (id: number) => void;
}

export function AnimeCard({ item, isCollected, onToggle }: AnimeCardProps) {
  // Sophisticated color palette for scores
  const scoreColor = 
    item.score >= 8.5 ? "text-yellow-400" : 
    item.score >= 7.5 ? "text-emerald-400" : 
    "text-neutral-500";

  return (
    <div
      className={`group relative flex flex-col bg-neutral-900/30 rounded-xl overflow-hidden border transition-all duration-300 h-full ${
        isCollected
          ? "border-emerald-500/30 bg-emerald-500/5 ring-1 ring-emerald-500/20"
          : "border-white/5 hover:border-white/20 hover:bg-neutral-900/60 hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/50"
      }`}
    >
      {/* 1. Poster Section (2:3 Aspect Ratio) */}
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-neutral-950 shrink-0">
        {item.img ? (
          <Image
            src={item.img.replace("http://", "https://")}
            alt={item.name}
            fill
            className={`object-cover transition-transform duration-700 ease-out group-hover:scale-105 ${isCollected ? 'grayscale-[0.5]' : ''}`}
            sizes="(max-width: 768px) 50vw, 20vw"
            unoptimized
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center text-neutral-800 gap-2">
            <div className="w-8 h-8 rounded-full border-2 border-dashed border-neutral-800 animate-pulse" />
          </div>
        )}
        
        {/* Quick Action: Collection */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onToggle(item.id);
          }}
          className={`absolute top-2 right-2 p-2 rounded-full backdrop-blur-md border shadow-lg transition-all duration-300 z-10 ${
            isCollected
              ? "bg-emerald-500 text-white border-emerald-400 scale-100 opacity-100"
              : "bg-black/40 text-white/70 border-white/10 opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100 hover:bg-white hover:text-black hover:border-white"
          }`}
        >
          {isCollected ? <Check size={14} strokeWidth={3} /> : <Plus size={14} strokeWidth={3} />}
        </button>
        
        {/* Subtle Gradient for legibility if we ever put text over image, mostly for aesthetic depth */}
        <div className="absolute inset-0 ring-1 ring-inset ring-black/10 pointer-events-none rounded-xl" />
      </div>

      {/* 2. Content Section */}
      <div className="p-3.5 flex flex-col flex-1 gap-2.5">
        
        {/* Title */}
        <div className="min-w-0">
          <h3 className="text-[13px] font-bold text-neutral-200 leading-5 line-clamp-2 tracking-wide" title={item.name}>
            {item.name}
          </h3>
        </div>

        {/* Metadata Line: Year • Type • Eps */}
        <div className="flex items-center gap-2 text-[10px] font-medium text-neutral-500 font-mono tracking-tight">
          <span className="text-neutral-400">{item.year || '----'}</span>
          <span className="w-0.5 h-2 bg-neutral-800 rounded-full" />
          <span>{item.type}</span>
          {item.eps > 0 && (
            <>
              <span className="w-0.5 h-2 bg-neutral-800 rounded-full" />
              <span>{item.eps} EP</span>
            </>
          )}
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Footer: Metrics */}
        <div className="flex items-end justify-between pt-3 border-t border-white/5">
          
          {/* Left: Score */}
          <div className="flex flex-col gap-0.5">
            <span className="text-[9px] uppercase tracking-wider text-neutral-600 font-bold">Score</span>
            <div className={`flex items-center gap-1.5 ${scoreColor}`}>
              <span className="text-lg font-bold font-mono leading-none tracking-tighter">
                {item.score?.toFixed(1) || '-.-'}
              </span>
            </div>
          </div>
          
          {/* Right: Rank & Votes */}
          <div className="flex flex-col items-end gap-0.5 text-neutral-500">
             <div className="flex items-center gap-1.5">
               {item.rank > 0 && (
                 <span className={`text-[10px] font-mono font-bold px-1 rounded ${item.rank <= 100 ? 'bg-yellow-500/20 text-yellow-500' : 'bg-neutral-800 text-neutral-400'}`}>
                   #{item.rank}
                 </span>
               )}
             </div>
             <span className="text-[9px] font-mono text-neutral-600">
               {item.total > 0 ? `${(item.total / 1000).toFixed(1)}k votes` : '-'}
             </span>
          </div>

        </div>

      </div>
    </div>
  );
}
