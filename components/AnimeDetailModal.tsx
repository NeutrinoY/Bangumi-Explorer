"use client";

import Image from "next/image";
import { X, ExternalLink, Clapperboard, Users, Music, BookOpen, User, Eye, Heart, Clock, PauseCircle, Check, Bookmark, Ban, Plus } from "lucide-react";
import type { BangumiSubject } from "@/hooks/useBangumiData";
import type { ItemStatus } from "@/hooks/useCollection";
import { useEffect } from "react";
import { motion } from "framer-motion";

interface AnimeDetailModalProps {
  item: BangumiSubject;
  onClose: () => void;
  status: ItemStatus;
  onUpdateStatus: (id: number, status: ItemStatus) => void;
  isAdmin: boolean;
}

const getSiteUrl = (site: string, id: string) => {
  switch (site) {
    case 'bangumi': return `https://bgm.tv/subject/${id}`;
    case 'bilibili': return `https://www.bilibili.com/bangumi/play/ss${id}`;
    case 'iqiyi': return `https://www.iqiyi.com/${id}.html`;
    case 'qq': return `https://v.qq.com/x/cover/${id}.html`;
    case 'nicovideo': return `https://ch.nicovideo.jp/${id}`;
    case 'netflix': return `https://www.netflix.com/title/${id}`;
    default: return null;
  }
};

export function AnimeDetailModal({ item, onClose, status, onUpdateStatus, isAdmin }: AnimeDetailModalProps) {
  useEffect(() => {
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = "hidden";
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }
    return () => {
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
    };
  }, []);

  const chart = item.score_chart || {};
  const maxVote = Math.max(...Object.values(chart).map(Number), 1);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center md:p-6">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="absolute inset-0 bg-black/90 backdrop-blur-sm" 
        onClick={onClose} 
      />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: "spring", damping: 25, stiffness: 300, mass: 0.5 }}
        className="relative w-full md:max-w-6xl h-full md:h-auto md:max-h-[90vh] bg-neutral-900 border-0 md:border border-neutral-800 md:rounded-xl shadow-2xl overflow-hidden flex flex-col md:flex-row z-10"
      >
        <button onClick={onClose} className="absolute top-4 right-4 z-20 p-2 bg-black/50 text-white rounded-full hover:bg-neutral-700 transition-colors backdrop-blur-md"><X size={20} /></button>

        {/* Sidebar (Image & Actions) */}
        <div className="w-full md:w-[300px] bg-neutral-950 p-5 flex flex-col gap-5 border-b md:border-b-0 md:border-r border-neutral-800 overflow-y-auto shrink-0 custom-scrollbar">
          
          <div className="relative w-[180px] mx-auto md:w-full rounded-lg overflow-hidden shadow-2xl border border-neutral-800 group bg-neutral-900 shrink-0">
            {item.img ? (
              <Image 
                src={item.img.replace("http://", "https://")} 
                alt={item.name} 
                width={300}
                height={450}
                className="w-full h-auto object-cover" 
                unoptimized 
              />
            ) : (
              <div className="flex aspect-[2/3] items-center justify-center text-neutral-800">No Image</div>
            )}
          </div>

          {/* Title on Mobile (Shown here for better hierarchy if image is small) */}
          <div className="md:hidden text-center">
             <h1 className="text-xl font-bold text-white leading-tight">{item.cn || item.name}</h1>
             <div className="text-2xl font-bold text-yellow-400 font-mono mt-2">{item.score.toFixed(1)}</div>
          </div>

          {/* ADMIN ONLY: Status Actions */}
          {isAdmin && (
            <div className="flex flex-col gap-2">
               <button
                onClick={() => onUpdateStatus(item.id, status === 'collected' ? null : 'collected')}
                className={`w-full py-3 rounded-md font-bold text-sm tracking-wide flex items-center justify-center gap-2 transition-all ${
                  status === 'collected'
                    ? "bg-green-600 hover:bg-green-500 text-white shadow-lg shadow-green-900/20"
                    : "bg-white text-black hover:bg-neutral-200"
                }`}
              >
                {status === 'collected' ? <><Check size={18} /> SAVED</> : <><Plus size={18} /> COLLECT</>}
              </button>
              
              <div className="grid grid-cols-2 gap-2">
                 <button
                    onClick={() => onUpdateStatus(item.id, status === 'wishlist' ? null : 'wishlist')}
                    className={`py-2 rounded-md font-bold text-xs flex items-center justify-center gap-1.5 transition-all border ${
                      status === 'wishlist'
                        ? "bg-blue-600 border-blue-500 text-white"
                        : "bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-600"
                    }`}
                  >
                    <Bookmark size={14} /> Wishlist
                  </button>
                  <button
                    onClick={() => onUpdateStatus(item.id, status === 'ignored' ? null : 'ignored')}
                    className={`py-2 rounded-md font-bold text-xs flex items-center justify-center gap-1.5 transition-all border ${
                      status === 'ignored'
                        ? "bg-red-900/50 border-red-500 text-red-200"
                        : "bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-600"
                    }`}
                  >
                    <Ban size={14} /> Ignore
                  </button>
              </div>
            </div>
          )}

          {/* Status Badge for Guest (Read-only) */}
          {!isAdmin && status && (
             <div className={`w-full py-3 rounded-md font-bold text-sm tracking-wide flex items-center justify-center gap-2 select-none cursor-default border ${
                status === 'collected' ? "bg-green-900/20 text-green-400 border-green-900" :
                status === 'wishlist' ? "bg-blue-900/20 text-blue-400 border-blue-900" :
                "bg-red-900/20 text-red-400 border-red-900"
             }`}>
                {status === 'collected' && <><Check size={16} /> Collected</>}
                {status === 'wishlist' && <><Bookmark size={16} /> Wishlist</>}
                {status === 'ignored' && <><Ban size={16} /> Ignored</>}
             </div>
          )}

          <div className="bg-neutral-900 rounded-lg p-3 border border-neutral-800">
            <h4 className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-3">Community Stats</h4>
            <div className="space-y-3">
               <StatRow icon={<Eye size={14} />} label="Watched" value={item.collection?.collect} color="text-blue-400" />
               <StatRow icon={<Heart size={14} />} label="Wish" value={item.collection?.wish} color="text-pink-400" />
               <StatRow icon={<Clock size={14} />} label="Doing" value={item.collection?.doing} color="text-yellow-400" />
               <StatRow icon={<PauseCircle size={14} />} label="On Hold" value={item.collection?.on_hold} color="text-neutral-400" />
            </div>
          </div>

          {item.sites && item.sites.length > 0 && (
            <div className="space-y-2 mt-auto">
              <h4 className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">Visit</h4>
              <div className="flex flex-wrap gap-2">
                {item.sites.map((siteObj) => {
                  const url = getSiteUrl(siteObj.site, siteObj.id);
                  if (!url) return null; 
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

        {/* Right Content */}
        <div 
          className="flex-1 overflow-y-auto bg-neutral-900/50 custom-scrollbar"
        >
          <div className="p-6 md:p-10 space-y-8 pb-24 md:pb-10">
            <div className="hidden md:block">
              <div className="flex items-center gap-3 mb-4 flex-wrap">
                <Badge text={item.type} color="bg-purple-500/10 text-purple-400 border-purple-500/20" />
                <Badge text={`${item.year}`} color="bg-neutral-800 text-neutral-400" />
                <Badge text={`${item.eps} Episodes`} color="bg-neutral-800 text-neutral-400" />
                {item.studio && <Badge text={item.studio.split(/,|，/)[0]} color="bg-blue-500/10 text-blue-400 border-blue-500/20" icon={<Clapperboard size={10} />} />}
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 leading-tight">{item.cn || item.name}</h1>
              {item.cn !== item.name && <h2 className="text-lg md:text-xl text-neutral-500 font-medium">{item.name}</h2>}
            </div>

            <div className="bg-black/20 p-4 md:p-6 rounded-xl border border-neutral-800/50 flex flex-col md:flex-row gap-8">
              {/* Score Info: Mobile (Row) / Desktop (Col) */}
              <div className="flex flex-row md:flex-col items-center md:items-start justify-between md:justify-center min-w-[120px] w-full md:w-auto gap-4">
                <div className="flex flex-col items-center md:items-start">
                   <div className="text-4xl md:text-5xl font-bold text-yellow-400 font-mono tracking-tighter">{item.score.toFixed(1)}</div>
                   <div className="text-[10px] md:text-xs text-neutral-500 mt-1 font-mono">{item.total.toLocaleString()} votes</div>
                </div>
                <div className="mt-0 md:mt-4 px-3 py-1 bg-neutral-800 rounded text-xs text-neutral-300 font-mono text-center border border-neutral-700">Rank #{item.rank}</div>
              </div>

              {/* Chart: Hidden on Mobile */}
              <div className="hidden md:flex flex-1 items-end gap-1 h-32 pb-1 border-b border-neutral-800">
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
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-neutral-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-neutral-700 z-10 font-mono">
                        {count}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <section>
                  <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-3">Synopsis</h3>
                  <p className="text-neutral-300 text-sm leading-7 whitespace-pre-line text-justify">
                    {item.summary || "No summary available."}
                  </p>
                </section>
                <section>
                  <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-3">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {item.tags.map(tag => (
                      <span key={tag} className="px-2.5 py-1 bg-neutral-800 border border-neutral-700/50 rounded text-xs text-neutral-400 cursor-default hover:text-white transition-colors">
                        {tag}
                      </span>
                    ))}
                  </div>
                </section>
              </div>
              <div className="space-y-6">
                <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Production Staff</h3>
                <div className="grid grid-cols-2 md:grid-cols-1 gap-4 md:gap-0 md:space-y-4">
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
      </motion.div>
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