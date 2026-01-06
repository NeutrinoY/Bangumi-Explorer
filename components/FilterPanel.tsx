"use client";

import { Search, SlidersHorizontal, Calendar, Star, Users, Layers, Trophy, X, Snowflake, Wind, Sun, CloudRain, ArrowDownUp } from "lucide-react";
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
    <div className="sticky top-0 z-50 bg-neutral-950/80 backdrop-blur-xl border-b border-white/5 transition-all">
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 py-3">
        
        {/* Compact Header */}
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          
          {/* Brand & Counts */}
          <div className="flex items-center gap-4 shrink-0 w-full md:w-auto justify-between md:justify-start">
            <div className="flex flex-col leading-none">
              <span className="text-sm font-black tracking-tight text-neutral-100">BANGUMI<span className="text-neutral-600">.DATA</span></span>
              <span className="text-[9px] text-neutral-500 font-mono mt-1">
                {showingCount.toLocaleString()} / {totalCount.toLocaleString()}
              </span>
            </div>
            
            <button onClick={() => setIsOpen(!isOpen)} className={`md:hidden p-2 rounded-full border transition-colors ${isOpen ? 'bg-neutral-100 text-black border-neutral-100' : 'bg-neutral-900 border-neutral-800 text-neutral-400'}`}>
              <SlidersHorizontal size={16} />
            </button>
          </div>

          {/* Search Bar - Centered & Wide */}
          <div className="relative w-full max-w-lg group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 group-focus-within:text-neutral-200 transition-colors" size={14} />
            <input
              type="text"
              placeholder="Search by name, studio, director..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="w-full bg-neutral-900/50 border border-neutral-800 text-neutral-200 text-xs rounded-full pl-9 pr-4 py-2 focus:outline-none focus:bg-neutral-900 focus:border-neutral-700 transition-all placeholder:text-neutral-600"
            />
          </div>

          {/* Right Actions */}
          <div className="hidden md:flex items-center gap-2">
            
            <div className="relative group">
              <ArrowDownUp size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none" />
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)} 
                className="appearance-none bg-neutral-900/50 border border-neutral-800 text-neutral-400 text-xs font-medium rounded-full pl-9 pr-4 py-1.5 focus:outline-none focus:border-neutral-600 cursor-pointer hover:bg-neutral-900 transition-colors"
              >
                <option value="rank">Rank</option>
                <option value="score">Score</option>
                <option value="date">Date</option>
                <option value="collected">Votes</option>
              </select>
            </div>

            <button 
              onClick={() => setIsOpen(!isOpen)} 
              className={`flex items-center gap-2 px-4 py-1.5 rounded-full border text-xs font-medium transition-all ${isOpen ? 'bg-neutral-100 text-black border-neutral-100' : 'bg-neutral-900/50 text-neutral-400 border-neutral-800 hover:bg-neutral-900 hover:text-neutral-200'}`}
            >
              <SlidersHorizontal size={12} /> Filters
            </button>
          </div>
        </div>

        {/* Expanded Controls */}
        {isOpen && (
          <div className="mt-4 pt-4 border-t border-white/5 animate-in slide-in-from-top-2 fade-in duration-200 pb-2">
            
            {/* Row 1: Numeric Filters */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-5">
              <FilterInputGroup icon={<Calendar size={12}/>} label="Year" min={filters.year[0]} max={filters.year[1]} onMin={(v) => updateMin('year', v)} onMax={(v) => updateMax('year', v)} />
              <FilterInputGroup icon={<Star size={12}/>} label="Score" min={filters.score[0]} max={filters.score[1]} step={0.1} onMin={(v) => updateMin('score', v)} onMax={(v) => updateMax('score', v)} />
              <FilterInputGroup icon={<Trophy size={12}/>} label="Rank" min={filters.rank[0]} max={filters.rank[1]} onMin={(v) => updateMin('rank', v)} onMax={(v) => updateMax('rank', v)} />
              <FilterInputGroup icon={<Users size={12}/>} label="Votes" min={filters.votes[0]} max={filters.votes[1]} onMin={(v) => updateMin('votes', v)} onMax={(v) => updateMax('votes', v)} />
              <FilterInputGroup icon={<Layers size={12}/>} label="Eps" min={filters.eps[0]} max={filters.eps[1]} onMin={(v) => updateMin('eps', v)} onMax={(v) => updateMax('eps', v)} />
            </div>

            {/* Row 2: Toggles & Actions */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              
              <div className="flex flex-wrap items-center gap-4">
                {/* Types */}
                <div className="flex items-center bg-neutral-900/50 rounded-full p-1 border border-neutral-800">
                  {["TV", "Movie", "OVA", "Web"].map(type => (
                    <button 
                      key={type} 
                      onClick={() => toggleType(type)} 
                      className={`px-3 py-1 rounded-full text-[10px] font-bold transition-all ${selectedTypes.has(type) ? "bg-neutral-700 text-white shadow-sm" : "text-neutral-500 hover:text-neutral-300"}`}
                    >
                      {type}
                    </button>
                  ))}
                </div>

                {/* Season (Conditional) */}
                {showSeasonSelector && (
                  <div className="flex items-center gap-1">
                    {[
                      {v:1, n:"Win", i:<Snowflake size={12}/>},
                      {v:4, n:"Spr", i:<Wind size={12}/>},
                      {v:7, n:"Sum", i:<Sun size={12}/>},
                      {v:10, n:"Fall", i:<CloudRain size={12}/>}
                    ].map(s => (
                      <button 
                        key={s.v} 
                        onClick={() => setSelectedSeason(selectedSeason === s.v ? null : s.v)} 
                        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border text-[10px] font-bold transition-all ${selectedSeason === s.v ? "bg-pink-500 text-white border-pink-500" : "bg-neutral-900/30 text-neutral-500 border-neutral-800 hover:border-neutral-700"}`}
                      >
                        {s.i} {s.n}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Reset & Hide */}
              <div className="flex items-center gap-2 md:ml-auto">
                 <button 
                  onClick={() => setHideCollected(!hideCollected)} 
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold border transition-all ${hideCollected ? "bg-green-900/20 text-green-400 border-green-900/50" : "bg-neutral-900/30 text-neutral-500 border-neutral-800 hover:bg-neutral-900"}`}
                >
                  {hideCollected ? <X size={10}/> : null} {hideCollected ? "Hidden" : "Show All"}
                </button>
                <button onClick={resetAll} className="px-3 py-1.5 rounded-full text-[10px] font-bold text-neutral-500 hover:text-white transition-colors">
                  Reset
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
    <div className="flex items-center gap-2 bg-neutral-900/30 border border-neutral-800/50 rounded-lg px-2 py-1.5 hover:border-neutral-700 transition-colors">
      <div className="text-neutral-500 shrink-0">{icon}</div>
      <div className="flex flex-col flex-1 min-w-0">
        <span className="text-[9px] font-bold uppercase tracking-wider text-neutral-600 mb-0.5">{label}</span>
        <div className="flex items-center gap-1">
          <input type="number" step={step} value={min} onChange={e => onMin(Number(e.target.value))} className="w-full bg-transparent p-0 text-[11px] font-mono text-neutral-300 text-center focus:outline-none focus:text-white" />
          <span className="text-neutral-700 text-[10px]">-</span>
          <input type="number" step={step} value={max} onChange={e => onMax(Number(e.target.value))} className="w-full bg-transparent p-0 text-[11px] font-mono text-neutral-300 text-center focus:outline-none focus:text-white" />
        </div>
      </div>
    </div>
  );
}
