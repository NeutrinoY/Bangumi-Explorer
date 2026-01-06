"use client";

import { Search, SlidersHorizontal, Calendar, Star, Users, Layers, Trophy, X, Snowflake, Wind, Sun, CloudRain } from "lucide-react";
import { useState } from "react";

interface FilterPanelProps {
  filters: {
    year: [number, number];
    score: [number, number];
    rank: [number, number];
    votes: [number, number];
    eps: [number, number];
  };
  setFilter: (key: string, val: [number, number]) => void;
  resetAll: () => void;

  selectedTypes: Set<string>; toggleType: (t: string) => void;
  searchText: string; setSearchText: (v: string) => void;
  hideCollected: boolean; setHideCollected: (v: boolean) => void;
  
  selectedSeason: number | null;
  setSelectedSeason: (v: number | null) => void;

  sortBy: string; setSortBy: (v: string) => void;
  totalCount: number; showingCount: number;
}

export function FilterPanel({
  filters, setFilter, resetAll,
  selectedTypes, toggleType,
  searchText, setSearchText,
  hideCollected, setHideCollected,
  selectedSeason, setSelectedSeason,
  sortBy, setSortBy,
  totalCount, showingCount
}: FilterPanelProps) {
  
  const [isOpen, setIsOpen] = useState(false);
  const showSeasonSelector = filters.year[0] === filters.year[1];

  const updateMin = (key: string, min: number) => {
    // @ts-ignore
    const currentMax = filters[key][1];
    setFilter(key, [min, currentMax]);
  };

  const updateMax = (key: string, max: number) => {
    // @ts-ignore
    const currentMin = filters[key][0];
    setFilter(key, [currentMin, max]);
  };

  return (
    <div className="sticky top-0 z-50 bg-neutral-950/95 backdrop-blur-md border-b border-neutral-800 shadow-xl transition-all">
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 py-3">
        
        {/* Top Bar */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex items-center gap-6 shrink-0 w-full md:w-auto justify-between md:justify-start">
            <div className="flex flex-col">
              <h1 className="text-xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent tracking-tight">
                BANGUMI <span className="text-white font-mono font-light">EXPLORER</span>
              </h1>
              <div className="text-[10px] text-neutral-500 font-mono tracking-wider uppercase">
                {showingCount.toLocaleString()} / {totalCount.toLocaleString()} ITEMS
              </div>
            </div>
            <button onClick={() => setIsOpen(!isOpen)} className={`md:hidden p-2 rounded-lg border ${isOpen ? 'bg-pink-500 text-white' : 'bg-neutral-900 border-neutral-800 text-neutral-400'}`}>
              <SlidersHorizontal size={18} />
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative w-full max-w-2xl group mx-auto hidden md:block">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 group-focus-within:text-pink-500 transition-colors" size={16} />
            <input
              type="text"
              placeholder="Search title, studio, director..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="w-full bg-neutral-900 border border-neutral-800 text-neutral-200 text-sm rounded-full pl-11 pr-4 py-2.5 focus:outline-none focus:border-pink-500/50 transition-all"
            />
          </div>

          {/* Actions */}
          <div className="hidden md:flex items-center gap-3">
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)} 
              className="bg-neutral-900 border border-neutral-800 text-neutral-400 text-xs font-bold rounded-lg px-3 py-2.5 focus:outline-none focus:border-pink-500 cursor-pointer"
            >
              <option value="rank">Sort: Rank</option>
              <option value="score">Sort: Score</option>
              <option value="date">Sort: Date</option>
              <option value="collected">Sort: Popularity</option>
            </select>
            <button 
              onClick={() => setIsOpen(!isOpen)} 
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full border text-xs font-bold tracking-wide transition-all ${isOpen ? 'bg-neutral-800 text-white border-neutral-700' : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:border-neutral-600'}`}
            >
              <SlidersHorizontal size={14} /> FILTERS
            </button>
          </div>
        </div>

        {/* Expanded Controls */}
        {isOpen && (
          <div className="mt-6 pt-6 border-t border-neutral-800/50 animate-in slide-in-from-top-2 fade-in duration-200">
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
              <FilterInputGroup icon={<Calendar size={14}/>} label="Year" min={filters.year[0]} max={filters.year[1]} onMin={(v) => updateMin('year', v)} onMax={(v) => updateMax('year', v)} />
              <FilterInputGroup icon={<Star size={14}/>} label="Score" min={filters.score[0]} max={filters.score[1]} step={0.1} onMin={(v) => updateMin('score', v)} onMax={(v) => updateMax('score', v)} />
              <FilterInputGroup icon={<Trophy size={14}/>} label="Rank" min={filters.rank[0]} max={filters.rank[1]} onMin={(v) => updateMin('rank', v)} onMax={(v) => updateMax('rank', v)} />
              <FilterInputGroup icon={<Users size={14}/>} label="Votes" min={filters.votes[0]} max={filters.votes[1]} onMin={(v) => updateMin('votes', v)} onMax={(v) => updateMax('votes', v)} />
              <FilterInputGroup icon={<Layers size={14}/>} label="Episodes" min={filters.eps[0]} max={filters.eps[1]} onMin={(v) => updateMin('eps', v)} onMax={(v) => updateMax('eps', v)} />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-6 border-t border-neutral-800/50 pt-5">
              <div className="flex flex-wrap items-center gap-6">
                <div className="flex items-center gap-4">
                  <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">Format</span>
                  <div className="flex gap-1.5">
                    {["TV", "Movie", "OVA", "Web"].map(type => (
                      <button key={type} onClick={() => toggleType(type)} className={`px-4 py-1.5 rounded-lg text-[11px] font-bold border transition-all ${selectedTypes.has(type) ? "bg-white text-black border-white" : "bg-neutral-900 text-neutral-500 border-neutral-800"}`}>{type}</button>
                    ))}
                  </div>
                </div>

                {showSeasonSelector && (
                  <div className="flex items-center gap-4 border-l border-neutral-800 pl-6">
                    <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">Season</span>
                    <div className="flex gap-2">
                      {[
                        {v:1, n:"Winter", i:<Snowflake size={14}/>},
                        {v:4, n:"Spring", i:<Wind size={14}/>},
                        {v:7, n:"Summer", i:<Sun size={14}/>},
                        {v:10, n:"Fall", i:<CloudRain size={14}/>}
                      ].map(s => (
                        <button key={s.v} onClick={() => setSelectedSeason(selectedSeason === s.v ? null : s.v)} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-[11px] font-bold transition-all ${selectedSeason === s.v ? "bg-pink-500 text-white border-pink-400" : "bg-neutral-900 text-neutral-500 border-neutral-800 hover:border-neutral-700"}`}>{s.i} {s.n}</button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setHideCollected(!hideCollected)} 
                  className={`flex items-center gap-2 px-5 py-1.5 rounded-full text-[11px] font-bold border transition-all ${hideCollected ? "bg-pink-500/10 text-pink-500 border-pink-500/50" : "bg-neutral-900 text-neutral-500 border-neutral-800"}`}
                >
                  {hideCollected ? <X size={12}/> : null} {hideCollected ? "Hidden Collected" : "Show All"}
                </button>
                <button onClick={resetAll} className="px-5 py-1.5 rounded-full text-[11px] font-bold border border-neutral-800 text-neutral-500 hover:text-white hover:border-neutral-600 transition-all">
                  RESET
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function FilterInputGroup({ icon, label, min, max, onMin, onMax, step = 1 }: any) {
  return (
    <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-3 flex flex-col gap-2 group hover:border-neutral-700 transition-all">
      <div className="flex items-center gap-2 text-neutral-500 group-hover:text-neutral-400 transition-colors">
        {icon} <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        <input type="number" step={step} value={min} onChange={e => onMin(Number(e.target.value))} className="w-full bg-neutral-950 border border-neutral-800 rounded px-2 py-1 text-xs text-white text-center focus:outline-none focus:border-pink-500/40" />
        <span className="text-neutral-600">-</span>
        <input type="number" step={step} value={max} onChange={e => onMax(Number(e.target.value))} className="w-full bg-neutral-950 border border-neutral-800 rounded px-2 py-1 text-xs text-white text-center focus:outline-none focus:border-pink-500/40" />
      </div>
    </div>
  );
}
