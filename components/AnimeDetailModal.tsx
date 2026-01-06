"use client";

import Image from "next/image";
import { X, ExternalLink, Clapperboard, Users, Music, BookOpen, User, Eye, Heart, Clock, PauseCircle } from "lucide-react";
import type { BangumiSubject } from "@/hooks/useBangumiData";
import { useEffect } from "react";

interface AnimeDetailModalProps {
  item: BangumiSubject;
  onClose: () => void;
  isCollected: boolean;
  onToggle: (id: number) => void;
}

// 简单的 URL 映射逻辑
const getSiteUrl = (site: string, id: string) => {
  switch (site) {
    case 'bangumi': return `https://bgm.tv/subject/${id}`;
    case 'bilibili': return `https://www.bilibili.com/bangumi/play/ss${id}`; // 假设 ID 是 Season ID
    case 'iqiyi': return `https://www.iqiyi.com/${id}.html`;
    case 'qq': return `https://v.qq.com/x/cover/${id}.html`;
    case 'nicovideo': return `https://ch.nicovideo.jp/${id}`;
    case 'netflix': return `https://www.netflix.com/title/${id}`;
    default: return null; // 未知站点不生成链接或仅显示名称
  }
};

export function AnimeDetailModal({ item, onClose, isCollected, onToggle }: AnimeDetailModalProps) {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = "unset"; };
  }, []);

  // Safe access to score chart
  const chart = item.score_chart || {};
  // Find max value for normalization
  const maxVote = Math.max(...Object.values(chart).map(Number), 1);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-6xl max-h-[90vh] bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl overflow-hidden flex flex-col md:flex-row">
        
        {/* Close Button */}
        <button onClick={onClose} className="absolute top-4 right-4 z-20 p-2 bg-black/50 text-white rounded-full hover:bg-neutral-700 transition-colors"><X size={20} /></button>

        {/* --- Left Sidebar --- */}
        <div className="w-full md:w-[300px] bg-neutral-950 p-5 flex flex-col gap-5 border-r border-neutral-800 overflow-y-auto shrink-0">
          
          {/* Cover */}
          <div className="relative aspect-[2/3] w-full rounded-lg overflow-hidden shadow-2xl border border-neutral-800 group bg-neutral-900">
            {item.img ? (
              <Image src={item.img.replace("http://", "https://")} alt={item.name} fill className="object-cover" unoptimized />
            ) : (
              <div className="flex h-full items-center justify-center text-neutral-800">No Image</div>
            )}
          </div>

          {/* Action */}
          <button
            onClick={() => onToggle(item.id)}
            className={`w-full py-3 rounded-md font-bold text-sm tracking-wide flex items-center justify-center gap-2 transition-all ${
              isCollected
                ? "bg-green-600 hover:bg-green-500 text-white shadow-lg shadow-green-900/20"
                : "bg-white text-black hover:bg-neutral-200"
            }`}
          >
            {isCollected ? "SAVED" : "COLLECT"}
          </button>

          {/* Stats Grid (Improved Layout for Large Numbers) */}
          <div className="bg-neutral-900 rounded-lg p-3 border border-neutral-800">
            <h4 className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-3">Community Stats</h4>
            <div className="space-y-3">
               <StatRow icon={<Eye size={14} />} label="Watched" value={item.collection?.collect} color="text-blue-400" />
               <StatRow icon={<Heart size={14} />} label="Wish" value={item.collection?.wish} color="text-pink-400" />
               <StatRow icon={<Clock size={14} />} label="Doing" value={item.collection?.doing} color="text-yellow-400" />
               <StatRow icon={<PauseCircle size={14} />} label="On Hold" value={item.collection?.on_hold} color="text-neutral-400" />
            </div>
          </div>

          {/* External Links (Real URLs) */}
          {item.sites && item.sites.length > 0 && (
            <div className="space-y-2 mt-auto">
              <h4 className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">Watch On</h4>
              <div className="flex flex-wrap gap-2">
                {item.sites.map((siteObj) => {
                  const url = getSiteUrl(siteObj.site, siteObj.id);
                  if (!url) return null; // Skip unknown sites for now
                  return (
                    <a 
                      key={siteObj.site} 
                      href={url} 
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 bg-neutral-900 border border-neutral-800 hover:border-neutral-600 rounded text-xs text-neutral-300 capitalize flex items-center gap-1.5 transition-colors"
                    >
                      <ExternalLink size={10} /> {siteObj.site}
                    </a>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* --- Right Content --- */}
        <div className="flex-1 overflow-y-auto bg-neutral-900/50">
          <div className="p-6 md:p-10 space-y-8">
            
            {/* Header */}
            <div>
              <div className="flex items-center gap-3 mb-4 flex-wrap">
                <Badge text={item.type} color="bg-purple-500/10 text-purple-400 border-purple-500/20" />
                <Badge text={`${item.year}`} color="bg-neutral-800 text-neutral-400" />
                <Badge text={`${item.eps} Episodes`} color="bg-neutral-800 text-neutral-400" />
                {item.studio && <Badge text={item.studio.split(/,|，/)[0]} color="bg-blue-500/10 text-blue-400 border-blue-500/20" icon={<Clapperboard size={10} />} />}
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 leading-tight">{item.cn || item.name}</h1>
              {item.cn !== item.name && <h2 className="text-lg md:text-xl text-neutral-500 font-medium">{item.name}</h2>}
            </div>

            {/* Score Dashboard */}
            <div className="bg-black/20 p-6 rounded-xl border border-neutral-800/50 flex flex-col md:flex-row gap-8">
              {/* Score Big Number */}
              <div className="flex flex-col justify-center min-w-[120px]">
                <div className="text-5xl font-bold text-yellow-400 font-mono tracking-tighter">{item.score.toFixed(1)}</div>
                <div className="text-xs text-neutral-500 mt-1 font-mono">{item.total.toLocaleString()} votes</div>
                <div className="mt-4 px-3 py-1 bg-neutral-800 rounded text-xs text-neutral-300 font-mono text-center">Rank #{item.rank}</div>
              </div>

              {/* Histogram */}
              <div className="flex-1 flex items-end gap-1 h-32 pb-1 border-b border-neutral-800">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => {
                  const count = chart[score.toString()] || 0;
                  const height = maxVote > 0 ? (count / maxVote) * 100 : 0;
                  return (
                    <div key={score} className="flex-1 flex flex-col items-center group relative h-full justify-end">
                      <div className="w-full bg-neutral-800/30 rounded-t-sm relative transition-colors h-full flex items-end">
                         <div 
                          className={`w-full rounded-t-sm transition-all duration-500 ${score >= 8 ? 'bg-yellow-500' : score >= 6 ? 'bg-neutral-500' : 'bg-neutral-700'}`}
                          style={{ height: `${Math.max(height, 2)}%` }}
                        />
                      </div>
                      <div className="text-[10px] text-neutral-600 mt-2 font-mono">{score}</div>
                      {/* Tooltip */}
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-neutral-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-neutral-700 z-10 font-mono">
                        {count}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Layout Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              <div className="lg:col-span-2 space-y-6">
                <section>
                  <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-3">Synopsis</h3>
                  <p className="text-neutral-300 text-sm leading-7 whitespace-pre-line">
                    {item.summary || "No summary available."}
                  </p>
                </section>

                <section>
                  <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-3">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {item.tags.map(tag => (
                      <span key={tag} className="px-2.5 py-1 bg-neutral-800 border border-neutral-700/50 rounded text-xs text-neutral-400 cursor-default">
                        {tag}
                      </span>
                    ))}
                  </div>
                </section>
              </div>

              <div className="space-y-6">
                <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Production Staff</h3>
                <div className="space-y-4">
                  <StaffRow label="Director" value={item.director} icon={<Users size={14}/>} />
                  <StaffRow label="Script" value={item.writer} icon={<BookOpen size={14}/>} />
                  <StaffRow label="Original" value={item.original} icon={<Clapperboard size={14}/>} />
                  <StaffRow label="Character" value={item.char_design} icon={<User size={14}/>} />
                  <StaffRow label="Music" value={item.music} icon={<Music size={14}/>} />
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatRow({ icon, label, value, color }: any) {
  return (
    <div className="flex items-center justify-between group">
      <div className="flex items-center gap-3 text-neutral-500 group-hover:text-neutral-300 transition-colors">
        {icon} <span className="text-xs font-medium">{label}</span>
      </div>
      <span className={`text-sm font-mono font-bold ${color}`}>{value ? value.toLocaleString() : '-'}</span>
    </div>
  );
}

function Badge({ text, color, icon }: any) {
  if (!text) return null;
  return (
    <div className={`px-2 py-1 rounded text-[10px] font-bold tracking-wider uppercase flex items-center gap-1.5 border border-transparent ${color}`}>
      {icon} {text}
    </div>
  );
}

function StaffRow({ label, value, icon }: any) {
  if (!value) return null;
  return (
    <div className="group">
      <div className="flex items-center gap-2 text-neutral-500 mb-1">
        {icon} <span className="text-[10px] font-bold uppercase">{label}</span>
      </div>
      <div className="text-sm text-neutral-200 pl-6 border-l-2 border-neutral-800 group-hover:border-pink-500/50 transition-colors">
        {value}
      </div>
    </div>
  );
}
