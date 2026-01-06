"use client";

import Image from "next/image";
import { Check, Plus } from "lucide-react";
import type { BangumiSubject } from "@/hooks/useBangumiData";

interface AnimeCardProps {
  item: BangumiSubject;
  isCollected: boolean;
  onToggle: (id: number) => void;
}

export function AnimeCard({ item, isCollected, onToggle }: AnimeCardProps) {
  const scoreColor = 
    item.score >= 8.5 ? "text-yellow-400" : 
    item.score >= 7.5 ? "text-green-400" : 
    "text-neutral-500";

  return (
    <div
      className={`group relative flex flex-col bg-neutral-900 rounded-lg overflow-hidden border transition-all duration-200 h-full ${
        isCollected
          ? "border-green-900/50 bg-green-900/5 opacity-60 hover:opacity-100"
          : "border-neutral-800 hover:border-pink-500/50 hover:shadow-lg hover:shadow-pink-500/5 hover:-translate-y-1"
      }`}
    >
      {/* 1. Image Section */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-neutral-950 shrink-0">
        {item.img ? (
          <Image
            src={item.img.replace("http://", "https://")}
            alt={item.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 50vw, 20vw"
            unoptimized
          />
        ) : (
          <div className="flex h-full items-center justify-center text-neutral-800 text-xs uppercase">NO IMAGE</div>
        )}
        
        {/* Rank Badge */}
        {item.rank > 0 && (
          <div className={`absolute top-2 left-2 px-1.5 py-0.5 rounded backdrop-blur-md border text-[10px] font-mono font-bold shadow-sm z-10 ${
            item.rank <= 100 ? "bg-yellow-500/90 text-black border-yellow-400" :
            "bg-black/60 text-white border-white/10"
          }`}>
            #{item.rank}
          </div>
        )}

        <button
          onClick={(e) => {
            e.preventDefault();
            onToggle(item.id);
          }}
          className={`absolute top-2 right-2 p-1.5 rounded-full shadow-sm backdrop-blur-md border transition-all z-10 ${
            isCollected
              ? "bg-green-500 border-green-400 text-white"
              : "bg-black/40 border-white/10 text-white hover:bg-pink-500 hover:border-pink-500"
          }`}
        >
          {isCollected ? <Check size={12} strokeWidth={3} /> : <Plus size={12} strokeWidth={3} />}
        </button>
        
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-neutral-900 via-neutral-900/80 to-transparent opacity-80" />
      </div>

      {/* 2. Text Section */}
      <div className="p-3 flex flex-col gap-3 flex-1">
        
        <div className="min-w-0">
          <h3 className="text-sm font-bold text-neutral-100 leading-snug line-clamp-1" title={item.cn || item.name}>
            {item.cn || item.name}
          </h3>
          <p className="text-[10px] text-neutral-500 truncate font-mono mt-0.5" title={item.name}>
            {item.name}
          </p>
        </div>

        {/* Specs Badge (Prominent Layout) */}
        <div className="flex items-center justify-between text-neutral-300 font-medium text-xs bg-neutral-800/50 rounded-md px-2 py-1.5 border border-neutral-800">
          <span className="font-mono">{item.year || '----'}</span>
          <div className="w-px h-3 bg-neutral-700"></div>
          <span className="uppercase tracking-wider text-[10px]">{item.type}</span>
          <div className="w-px h-3 bg-neutral-700"></div>
          <span>{item.eps ? `${item.eps} ep` : '?'}</span>
        </div>

        {/* Metrics Row */}
        <div className="mt-auto pt-1 flex items-end justify-between">
          <div className="flex flex-col">
            <span className="text-[9px] text-neutral-600 font-bold uppercase tracking-wider">Score</span>
            <span className={`text-xl font-bold font-mono leading-none ${scoreColor}`}>
              {item.score?.toFixed(1)}
            </span>
          </div>
          
          <div className="flex flex-col items-end">
            <span className="text-[9px] text-neutral-600 font-bold uppercase tracking-wider">Votes</span>
            <span className="text-xs text-neutral-300 font-mono tabular-nums leading-none mb-0.5">
              {item.total.toLocaleString()}
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}
