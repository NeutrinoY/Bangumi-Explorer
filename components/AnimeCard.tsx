"use client";

import Image from "next/image";
import { Check, Plus, X, Bookmark, Ban } from "lucide-react";
import type { BangumiSubject } from "@/hooks/useBangumiData";
import type { ItemStatus } from "@/hooks/useCollection";

interface AnimeCardProps {
  item: BangumiSubject;
  status: ItemStatus; // 'collected' | 'wishlist' | 'ignored' | null
  onUpdateStatus: (id: number, status: ItemStatus) => void;
}

export function AnimeCard({ item, status, onUpdateStatus }: AnimeCardProps) {
  // Bangumi Strict Scoring Colors
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

  // Status Styling
  let borderClass = "border-neutral-800";
  let bgClass = "bg-neutral-900";
  let opacityClass = "opacity-100";
  let grayscaleClass = "grayscale-0";

  switch (status) {
    case 'collected':
      borderClass = "border-green-500/50";
      bgClass = "bg-green-950/20";
      break;
    case 'wishlist':
      borderClass = "border-blue-500/50";
      bgClass = "bg-blue-950/20";
      break;
    case 'ignored':
      borderClass = "border-neutral-800";
      opacityClass = "opacity-40 hover:opacity-100 transition-opacity";
      grayscaleClass = "grayscale";
      break;
    default:
      // Normal: Hover effects handled in container
      break;
  }

  return (
    <div
      className={`group relative flex flex-col rounded-lg overflow-hidden border transition-all duration-200 h-full ${borderClass} ${bgClass} ${opacityClass}`}
    >
      {/* 1. Image Section */}
      <div className={`relative aspect-[3/4] w-full overflow-hidden bg-neutral-950 shrink-0`}>
        {item.img ? (
          <Image
            src={item.img.replace("http://", "https://")}
            alt={item.name}
            fill
            className={`object-cover transition-transform duration-500 group-hover:scale-105 ${grayscaleClass}`}
            sizes="(max-width: 768px) 50vw, 20vw"
            unoptimized
          />
        ) : (
          <div className="flex h-full items-center justify-center text-neutral-800 text-xs uppercase">NO IMAGE</div>
        )}
        
        {/* Rank Badge */}
        {item.rank > 0 && (
          <div className={`absolute top-2 left-2 px-2.5 py-1 rounded-md backdrop-blur-md border text-sm font-mono font-bold shadow-md z-10 ${
            item.rank <= 100 ? "bg-yellow-500/90 text-black border-yellow-400" :
            item.rank <= 500 ? "bg-white/90 text-black border-white" :
            "bg-black/60 text-white border-white/10"
          }`}>
            #{item.rank}
          </div>
        )}

        {/* Action Overlay (Bottom Slide-in) */}
        <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black via-black/80 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-200 z-20 flex items-center justify-around gap-2">
            
            {/* Ignore */}
            <button 
              onClick={(e) => { e.stopPropagation(); onUpdateStatus(item.id, status === 'ignored' ? null : 'ignored'); }}
              className={`p-2 rounded-full border backdrop-blur-md transition-all ${status === 'ignored' ? "bg-red-500 border-red-400 text-white" : "bg-black/50 border-white/10 text-neutral-400 hover:text-white hover:bg-red-900/50 hover:border-red-500"}`}
              title="Ignore"
            >
              <Ban size={16} />
            </button>

            {/* Wishlist */}
            <button 
              onClick={(e) => { e.stopPropagation(); onUpdateStatus(item.id, status === 'wishlist' ? null : 'wishlist'); }}
              className={`p-2 rounded-full border backdrop-blur-md transition-all ${status === 'wishlist' ? "bg-blue-500 border-blue-400 text-white" : "bg-black/50 border-white/10 text-neutral-400 hover:text-white hover:bg-blue-900/50 hover:border-blue-500"}`}
              title="Wishlist"
            >
              <Bookmark size={16} />
            </button>

            {/* Collect */}
            <button 
              onClick={(e) => { e.stopPropagation(); onUpdateStatus(item.id, status === 'collected' ? null : 'collected'); }}
              className={`p-2 rounded-full border backdrop-blur-md transition-all ${status === 'collected' ? "bg-green-500 border-green-400 text-white" : "bg-black/50 border-white/10 text-neutral-400 hover:text-white hover:bg-green-900/50 hover:border-green-500"}`}
              title="Collect"
            >
              <Check size={16} />
            </button>
        </div>
        
        {/* Current Status Indicator (Top Right - Always Visible if set) */}
        {status && (
           <div className={`absolute top-2 right-2 p-1.5 rounded-full border shadow-md z-10 ${
             status === 'collected' ? 'bg-green-500 border-green-400 text-white' :
             status === 'wishlist' ? 'bg-blue-500 border-blue-400 text-white' :
             'bg-red-500 border-red-400 text-white'
           }`}>
             {status === 'collected' && <Check size={12} strokeWidth={4} />}
             {status === 'wishlist' && <Bookmark size={12} fill="currentColor" />}
             {status === 'ignored' && <X size={12} strokeWidth={4} />}
           </div>
        )}

        {/* Type Badge */}
        <div className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-black/80 backdrop-blur rounded text-[10px] font-bold text-neutral-300 uppercase tracking-wider border border-white/10 group-hover:opacity-0 transition-opacity">
          {item.type}
        </div>
      </div>

      {/* 2. Compact Info Section */}
      <div className="p-3 flex flex-col gap-2 flex-1">
        
        {/* Titles */}
        <div className="min-w-0">
          <h3 className={`text-sm font-bold leading-snug line-clamp-1 transition-colors ${status === 'ignored' ? 'text-neutral-500' : 'text-neutral-100'}`} title={item.cn || item.name}>
            {item.cn || item.name}
          </h3>
          <div className="flex items-center gap-2 mt-0.5">
             <p className="text-[10px] text-neutral-500 truncate font-mono flex-1" title={item.name}>
               {item.name}
             </p>
          </div>
        </div>

        {/* Meta */}
        <div className="flex items-center gap-2 text-[11px] text-neutral-400 font-mono leading-none">
           <span className="font-bold">{item.year || '----'}</span>
           <span className="text-neutral-700">|</span>
           <span>{item.eps ? `${item.eps} ep` : '?'}</span>
        </div>

        <div className="h-px bg-neutral-800/80 my-0.5"></div>

        {/* Metrics */}
        <div className="flex items-end justify-between mt-auto">
          <div className="flex flex-col">
            <span className="text-[9px] text-neutral-600 font-bold uppercase tracking-wider mb-0.5">Score</span>
            <span className={`text-2xl font-bold font-mono leading-none tracking-tight ${status === 'ignored' ? 'text-neutral-600' : scoreColor}`}>
              {item.score?.toFixed(1)}
            </span>
          </div>
          
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
