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
  // Bangumi Strict Scoring Colors (Detailed)
  // 9+ Gold, 8-9 Orange/Pink, 7.5-8 Green, 7-7.5 Cyan, 6-7 Gray, <6 Dark
  const getScoreColor = (s: number) => {
    if (s >= 9.0) return "text-[#FFD700]"; // Gold
    if (s >= 8.5) return "text-[#FF4500]"; // OrangeRed
    if (s >= 8.0) return "text-[#FF69B4]"; // HotPink
    if (s >= 7.5) return "text-[#32CD32]"; // LimeGreen
    if (s >= 7.0) return "text-[#00CED1]"; // DarkTurquoise
    if (s >= 6.0) return "text-[#A9A9A9]"; // DarkGray
    return "text-[#696969]"; // DimGray
  };

  const scoreColor = getScoreColor(item.score);

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
        
        {/* Rank Badge (Large & Clear) */}
        {item.rank > 0 && (
          <div className={`absolute top-2 left-2 px-2.5 py-1 rounded-md backdrop-blur-md border text-sm font-mono font-bold shadow-md z-10 ${
            item.rank <= 100 ? "bg-yellow-500/90 text-black border-yellow-400" :
            item.rank <= 500 ? "bg-white/90 text-black border-white" :
            "bg-black/60 text-white border-white/10"
          }`}>
            #{item.rank}
          </div>
        )}

        {/* Collect Button (Massive Hit Area) */}
        <button
          onClick={(e) => {
            e.preventDefault();
            onToggle(item.id);
          }}
          className={`absolute top-2 right-2 p-2.5 rounded-full shadow-md backdrop-blur-md border transition-all z-10 group/btn ${
            isCollected
              ? "bg-green-500 border-green-400 text-white"
              : "bg-black/40 border-white/10 text-white hover:bg-pink-500 hover:border-pink-500 hover:scale-110"
          }`}
          title={isCollected ? "Remove from collection" : "Add to collection"}
        >
          {isCollected ? <Check size={18} strokeWidth={3} /> : <Plus size={18} strokeWidth={3} />}
        </button>
        
        {/* Type Badge (Bottom Right Overlay) */}
        <div className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-black/80 backdrop-blur rounded text-[10px] font-bold text-neutral-300 uppercase tracking-wider border border-white/10">
          {item.type}
        </div>
      </div>

      {/* 2. Compact Info Section */}
      <div className="p-3 flex flex-col gap-2 flex-1">
        
        {/* Titles (Primary & Secondary) */}
        <div className="min-w-0">
          <h3 className="text-sm font-bold text-neutral-100 leading-snug line-clamp-1" title={item.cn || item.name}>
            {item.cn || item.name}
          </h3>
          <div className="flex items-center gap-2 mt-0.5">
             <p className="text-[10px] text-neutral-500 truncate font-mono flex-1" title={item.name}>
               {item.name}
             </p>
          </div>
        </div>

        {/* Meta Line: Year | Eps */}
        <div className="flex items-center gap-2 text-[11px] text-neutral-400 font-mono leading-none">
           <span className="font-bold">{item.year || '----'}</span>
           <span className="text-neutral-700">|</span>
           <span>{item.eps ? `${item.eps} ep` : '?'}</span>
        </div>

        {/* Divider */}
        <div className="h-px bg-neutral-800/80 my-0.5"></div>

        {/* Metrics Row (High Density & Clear) */}
        <div className="flex items-end justify-between mt-auto">
          {/* Score Block */}
          <div className="flex flex-col">
            <span className="text-[9px] text-neutral-600 font-bold uppercase tracking-wider mb-0.5">Score</span>
            <span className={`text-2xl font-bold font-mono leading-none tracking-tight ${scoreColor}`}>
              {item.score?.toFixed(1)}
            </span>
          </div>
          
          {/* Votes Block (Full Number) */}
          <div className="flex flex-col items-end">
            <span className="text-[9px] text-neutral-600 font-bold uppercase tracking-wider mb-0.5">Votes</span>
            <span className="text-xs text-neutral-300 font-mono tabular-nums font-medium">
              {item.total.toLocaleString()}
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}