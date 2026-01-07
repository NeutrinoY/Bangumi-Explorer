"use client";

import { Search, SlidersHorizontal, Calendar, Star, Users, Layers, Trophy, X, Snowflake, Wind, Sun, CloudRain, Check, ChevronDown, Flame, Gem, Hourglass, Zap, Clapperboard, Film, Bookmark, Ban, ListFilter } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export type StatusFilterType = 'todo' | 'collected' | 'ignored' | 'all';

interface FilterPanelProps {
  filters: {
    year: [number, number];
    score: [number, number];
    rank: [number, number];
    votes: [number, number];
    eps: [number, number];
  };
  setFilter: (key: string, val: [number, number]) => void;
  applyFilters: (filters: any, types?: Set<string>) => void;
  resetAll: () => void;

  selectedTypes: Set<string>; toggleType: (t: string) => void;
  searchText: string; setSearchText: (v: string) => void;
  
  statusFilter: StatusFilterType;
  setStatusFilter: (v: StatusFilterType) => void;
  
  selectedSeason: number | null;
  setSelectedSeason: (v: number | null) => void;

  sortBy: string; setSortBy: (v: string) => void;
  totalCount: number; showingCount: number;
}

// Global Defaults
const DEFAULT_TYPES = new Set(["TV", "Movie", "OVA", "Web"]);
const DEFAULT_FILTERS = {
  year: [0, 2030], 
  votes: [0, 999999],
  rank: [0, 99999],
  score: [0, 10]
};

const NON_MOVIE_TYPES = ["TV", "OVA", "Web"];
const MOVIE_TYPES = ["Movie"];

const PRESETS = [
  { 
    id: 'modern_hits', 
    label: 'Modern Hits', 
    icon: <Flame size={12} />,
    color: 'text-orange-400 border-orange-500/30 hover:bg-orange-500/10',
    activeColor: 'bg-orange-500 text-white border-orange-500',
    apply: { year: [2006, 2026], votes: [2000, 999999], rank: [0, 99999], score: [0, 10] },
    types: NON_MOVIE_TYPES
  },
  { 
    id: 'modern_gems', 
    label: 'Modern Gems', 
    icon: <Gem size={12} />,
    color: 'text-purple-400 border-purple-500/30 hover:bg-purple-500/10',
    activeColor: 'bg-purple-500 text-white border-purple-500',
    apply: { year: [2006, 2026], votes: [1000, 1999], rank: [0, 99999], score: [0, 10] },
    types: NON_MOVIE_TYPES
  },
  { 
    id: 'retro_classics', 
    label: 'Retro Classics', 
    icon: <Hourglass size={12} />,
    color: 'text-yellow-400 border-yellow-500/30 hover:bg-yellow-500/10',
    activeColor: 'bg-yellow-500 text-black border-yellow-500',
    apply: { year: [0, 2005], votes: [2000, 999999], rank: [0, 99999], score: [0, 10] },
    types: NON_MOVIE_TYPES
  },
  { 
    id: 'retro_cult', 
    label: 'Retro Cult', 
    icon: <Zap size={12} />,
    color: 'text-cyan-400 border-cyan-500/30 hover:bg-cyan-500/10',
    activeColor: 'bg-cyan-500 text-black border-cyan-500',
    apply: { year: [0, 2005], votes: [1000, 1999], rank: [0, 99999], score: [0, 10] },
    types: NON_MOVIE_TYPES
  },
  { 
    id: 'movie_hits', 
    label: 'Movie Hits', 
    icon: <Clapperboard size={12} />,
    color: 'text-red-400 border-red-500/30 hover:bg-red-500/10',
    activeColor: 'bg-red-500 text-white border-red-500',
    apply: { year: [0, 2030], votes: [2000, 999999], rank: [0, 99999], score: [0, 10] },
    types: MOVIE_TYPES
  },
  { 
    id: 'movie_gems', 
    label: 'Movie Gems', 
    icon: <Film size={12} />,
    color: 'text-rose-300 border-rose-400/30 hover:bg-rose-400/10',
    activeColor: 'bg-rose-400 text-white border-rose-400',
    apply: { year: [0, 2030], votes: [500, 1999], rank: [0, 99999], score: [0, 10] },
    types: MOVIE_TYPES
  }
];

export function FilterPanel({
  filters, setFilter, applyFilters, resetAll,
  selectedTypes, toggleType,
  searchText, setSearchText,
  statusFilter, setStatusFilter,
  selectedSeason, setSelectedSeason,
  sortBy, setSortBy,
  totalCount, showingCount
}: FilterPanelProps) {
  
  const [isOpen, setIsOpen] = useState(false);
  const showSeasonSelector = filters.year[0] === filters.year[1];
  const panelRef = useRef<HTMLDivElement>(null);
  
  const [useShortSeries, setUseShortSeries] = useState(false);
  const [useSeriesOnly, setUseSeriesOnly] = useState(false);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  useEffect(() => {
    if (selectedTypes.has("Movie")) {
      if (useShortSeries) setUseShortSeries(false);
      if (useSeriesOnly) setUseSeriesOnly(false);
      
      if (filters.eps[0] !== 0 || filters.eps[1] !== 9999) {
         setFilter('eps', [0, 9999]);
      }
    }
  }, [selectedTypes]);

  const updateMin = (key: string, val: number, limitMin: number, limitMax: number) => {
    let v = Math.max(limitMin, Math.min(val, limitMax));
    // @ts-ignore
    const currentMax = filters[key][1];
    if (v > currentMax) v = currentMax; 
    setFilter(key, [v, currentMax]);
  };

  const updateMax = (key: string, val: number, limitMin: number, limitMax: number) => {
    let v = Math.max(limitMin, Math.min(val, limitMax));
    // @ts-ignore
    const currentMin = filters[key][0];
    if (v < currentMin) v = currentMin; 
    setFilter(key, [currentMin, v]);
  };

  const isPresetActive = (preset: typeof PRESETS[0]) => {
    if (selectedTypes.size !== preset.types.length) return false;
    for (const t of preset.types) {
      if (!selectedTypes.has(t)) return false;
    }

    const f = filters;
    const p = preset.apply;

    if (f.year[0] !== p.year[0] || f.year[1] !== p.year[1]) return false;
    if (f.votes[0] !== p.votes[0] || f.votes[1] !== p.votes[1]) return false;
    if (f.rank[0] !== p.rank[0] || f.rank[1] !== p.rank[1]) return false;
    if (f.score[0] !== p.score[0] || f.score[1] !== p.score[1]) return false;
    
    return true;
  };

  const handlePresetClick = (preset: typeof PRESETS[0]) => {
    if (isPresetActive(preset)) {
      applyFilters(DEFAULT_FILTERS, DEFAULT_TYPES);
    } else {
      applyFilters(preset.apply, new Set(preset.types));
    }
  };

  const toggleShortSeries = () => {
    const newVal = !useShortSeries;
    setUseShortSeries(newVal);
    const min = useSeriesOnly ? 2 : 0;
    const max = newVal ? 52 : 9999;
    setFilter('eps', [min, max]);
  };

  const toggleSeriesOnly = () => {
    const newVal = !useSeriesOnly;
    setUseSeriesOnly(newVal);
    const min = newVal ? 2 : 0;
    const max = useShortSeries ? 52 : 9999;
    setFilter('eps', [min, max]);
  };

  const seasonConfig = [
    {v:1, n:"Winter", i:<Snowflake size={14}/>, activeClass: "bg-sky-500/20 text-sky-300 border-sky-500/50"},
    {v:4, n:"Spring", i:<Wind size={14}/>,      activeClass: "bg-emerald-500/20 text-emerald-300 border-emerald-500/50"},
    {v:7, n:"Summer", i:<Sun size={14}/>,       activeClass: "bg-orange-500/20 text-orange-300 border-orange-500/50"},
    {v:10, n:"Fall", i:<CloudRain size={14}/>,  activeClass: "bg-amber-500/20 text-amber-300 border-amber-500/50"}
  ];

  const statusOptions = [
    { id: 'todo', label: 'Todo', icon: <ListFilter size={12}/>, activeClass: "bg-neutral-100 text-black border-white" },
    { id: 'collected', label: 'Saved', icon: <Check size={12}/>, activeClass: "bg-green-500 text-white border-green-400" },
    { id: 'ignored', label: 'Ignored', icon: <Ban size={12}/>, activeClass: "bg-red-500 text-white border-red-400" },
    { id: 'all', label: 'All', icon: <Layers size={12}/>, activeClass: "bg-neutral-800 text-white border-neutral-600" },
  ];

  const isMovieSelected = selectedTypes.has("Movie");

  return (
    <div ref={panelRef} className="sticky top-0 z-50 transition-all">
      <div className="absolute inset-0 bg-neutral-950/80 backdrop-blur-xl border-b border-neutral-800 shadow-sm z-0"></div>

      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 py-4 relative z-10">
        
        {/* Top Bar */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex items-center gap-6 shrink-0 w-full md:w-auto justify-between md:justify-start">
            <div className="flex flex-col select-none">
              <h1 className="text-xl font-black italic tracking-tighter text-white">
                BANGUMI <span className="text-pink-500">EXPLORER</span>
              </h1>
              <div className="text-[9px] text-neutral-500 font-mono font-bold uppercase tracking-widest flex items-center gap-2">
                <span>Database v2.0</span>
                <div className="w-1 h-1 bg-neutral-700 rounded-full"></div>
                <span className={showingCount === 0 ? "text-red-500" : "text-neutral-400"}>{showingCount.toLocaleString()} Found</span>
              </div>
            </div>
            
            <button 
              onClick={() => setIsOpen(!isOpen)} 
              className={`md:hidden p-2.5 rounded-xl border transition-all ${isOpen ? 'bg-pink-600 text-white border-pink-500' : 'bg-neutral-900 border-neutral-800 text-neutral-400'}`}
            >
              <SlidersHorizontal size={18} />
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative w-full max-w-xl group hidden md:block">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="text-neutral-600 group-focus-within:text-pink-500 transition-colors" size={16} />
            </div>
            <input
              type="text"
              placeholder="Search anime title, studio, staff..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="w-full bg-neutral-900/50 border border-neutral-800/80 text-neutral-200 text-sm rounded-full pl-11 pr-4 py-3 focus:outline-none focus:bg-neutral-900 focus:border-pink-500/50 transition-all shadow-inner placeholder:text-neutral-600"
            />
          </div>

          {/* Actions */}
          <div className="hidden md:flex items-center gap-6">
            
            <SortSelect value={sortBy} onChange={setSortBy} />

            <button 
              onClick={() => setIsOpen(!isOpen)} 
              className={`flex items-center gap-2 px-5 py-2 rounded-full border text-xs font-bold tracking-wide transition-all shadow-sm ${isOpen ? 'bg-neutral-100 text-black border-white' : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:border-neutral-600 hover:text-neutral-200'}`}
            >
              <SlidersHorizontal size={14} strokeWidth={2.5} /> 
              <span>FILTERS</span>
            </button>
          </div>
        </div>

        {/* Mobile Search */}
        <div className="md:hidden mt-4 relative">
             <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500" size={16} />
             <input
              type="text"
              placeholder="Search..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="w-full bg-neutral-900 border border-neutral-800 text-neutral-200 text-sm rounded-lg pl-11 pr-4 py-2.5 focus:outline-none focus:border-pink-500"
            />
        </div>
      </div>

      {/* Overlay Filter Content (Absolute) */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute left-0 right-0 top-full border-b border-neutral-800/80 shadow-2xl z-0"
          >
             {/* Backdrop */}
            <div className="absolute inset-0 bg-neutral-950/95 backdrop-blur-xl" />
            
            <div className="relative max-w-[1920px] mx-auto px-4 sm:px-6 py-6">
              <div className="space-y-6">

                {/* --- Quick Presets Area --- */}
                <div className="flex flex-col xl:flex-row items-center justify-between gap-4 pb-4 border-b border-neutral-800/50">
                   <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                      <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider py-1.5 mr-2">Presets</span>
                      {PRESETS.map(preset => {
                        const active = isPresetActive(preset);
                        return (
                          <button
                            key={preset.id}
                            onClick={() => handlePresetClick(preset)}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-[11px] font-bold transition-all ${active ? preset.activeColor : `bg-neutral-900/50 border-neutral-800 ${preset.color}`}`}
                          >
                            {preset.icon}
                            <span>{preset.label}</span>
                          </button>
                        );
                      })}
                   </div>

                   <div className={`flex items-center gap-2 transition-opacity duration-300 ${isMovieSelected ? "opacity-30 pointer-events-none" : "opacity-100"}`}>
                     <button 
                       onClick={toggleShortSeries}
                       disabled={isMovieSelected}
                       className={`flex items-center gap-2 px-4 py-1.5 rounded-lg border text-[11px] font-bold transition-all ${useShortSeries ? "bg-indigo-500/20 text-indigo-300 border-indigo-500/50" : "bg-neutral-900/50 border-neutral-800 text-neutral-500 hover:border-neutral-700"}`}
                     >
                       <Zap size={12} className={useShortSeries ? "text-indigo-400" : "text-neutral-600"} />
                       Max 52 Eps
                     </button>
                     <button 
                       onClick={toggleSeriesOnly}
                       disabled={isMovieSelected}
                       className={`flex items-center gap-2 px-4 py-1.5 rounded-lg border text-[11px] font-bold transition-all ${useSeriesOnly ? "bg-teal-500/20 text-teal-300 border-teal-500/50" : "bg-neutral-900/50 border-neutral-800 text-neutral-500 hover:border-neutral-700"}`}
                     >
                       <Layers size={12} className={useSeriesOnly ? "text-teal-400" : "text-neutral-600"} />
                       {'>'} 1 Ep
                     </button>
                   </div>
                </div>
                
                {/* Row 1: Range Filters */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                  <FilterInputGroup 
                    icon={<Calendar size={14}/>} label="Year" 
                    min={filters.year[0]} max={filters.year[1]} 
                    limitMin={0} limitMax={2030}
                    onMin={(v) => updateMin('year', v, 0, 2030)} onMax={(v) => updateMax('year', v, 0, 2030)} 
                    active={showSeasonSelector}
                  />
                  <FilterInputGroup icon={<Star size={14}/>} label="Score" min={filters.score[0]} max={filters.score[1]} step={0.1} limitMin={0} limitMax={10} onMin={(v) => updateMin('score', v, 0, 10)} onMax={(v) => updateMax('score', v, 0, 10)} />
                  <FilterInputGroup icon={<Trophy size={14}/>} label="Rank" min={filters.rank[0]} max={filters.rank[1]} limitMin={0} limitMax={99999} onMin={(v) => updateMin('rank', v, 0, 99999)} onMax={(v) => updateMax('rank', v, 0, 99999)} />
                  <FilterInputGroup icon={<Users size={14}/>} label="Votes" min={filters.votes[0]} max={filters.votes[1]} limitMin={0} limitMax={999999} onMin={(v) => updateMin('votes', v, 0, 999999)} onMax={(v) => updateMax('votes', v, 0, 999999)} />
                  <FilterInputGroup icon={<Layers size={14}/>} label="Episodes" min={filters.eps[0]} max={filters.eps[1]} limitMin={0} limitMax={9999} onMin={(v) => updateMin('eps', v, 0, 9999)} onMax={(v) => updateMax('eps', v, 0, 9999)} />
                </div>

                {/* Row 2: Advanced Options & Season */}
                <div className="flex flex-col xl:flex-row gap-8 pt-4 border-t border-neutral-800/50">
                  
                  <div className="flex flex-col md:flex-row gap-8 items-start">
                    <div className="flex flex-col gap-3">
                      <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider pl-1">Format</span>
                      <div className="flex gap-2">
                        {["TV", "Movie", "OVA", "Web"].map(type => (
                          <button 
                            key={type} 
                            onClick={() => toggleType(type)} 
                            className={`px-4 py-1.5 rounded-lg text-[11px] font-bold transition-all border ${selectedTypes.has(type) ? "bg-pink-600 border-pink-500 text-white shadow-md shadow-pink-900/50" : "bg-neutral-900 border-neutral-800 text-neutral-500 hover:text-neutral-300 hover:border-neutral-700"}`}
                          >
                            {type}
                          </button>
                        ))}
                      </div>
                    </div>

                    <AnimatePresence mode="popLayout">
                      {showSeasonSelector && (
                        <motion.div 
                          initial={{ opacity: 0, x: -10, filter: 'blur(5px)' }}
                          animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                          exit={{ opacity: 0, scale: 0.95, filter: 'blur(5px)' }}
                          className="flex flex-col gap-3"
                        >
                          <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider pl-1 flex items-center gap-2">
                             {filters.year[0]} Season
                          </span>
                          <div className="grid grid-cols-4 w-full md:w-auto bg-neutral-900/50 p-1 rounded-lg border border-neutral-800 gap-1">
                            {seasonConfig.map(s => {
                              const isActive = selectedSeason === s.v;
                              return (
                                <button 
                                  key={s.v} 
                                  onClick={() => setSelectedSeason(isActive ? null : s.v)} 
                                  className={`
                                    relative flex items-center justify-center gap-2 px-4 py-1.5 rounded-md text-[11px] font-bold transition-all border
                                    ${isActive 
                                      ? s.activeClass 
                                      : "border-transparent text-neutral-500 hover:text-neutral-300 hover:bg-neutral-800"}
                                  `}
                                >
                                  <span className={isActive ? "opacity-100" : "opacity-70"}>{s.i}</span>
                                  <span className="hidden lg:inline">{s.n}</span>
                                </button>
                              );
                            })}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Toggles & Reset */}
                  <div className="xl:ml-auto flex items-end gap-3">
                     {/* Status Filter Tabs */}
                     <div className="flex bg-neutral-900 rounded-lg p-1 border border-neutral-800">
                        {statusOptions.map(opt => (
                          <button
                            key={opt.id}
                            onClick={() => setStatusFilter(opt.id as StatusFilterType)}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-[10px] font-bold uppercase transition-all border ${
                              statusFilter === opt.id ? opt.activeClass : "border-transparent text-neutral-500 hover:text-neutral-300"
                            }`}
                          >
                            {opt.icon} <span className="hidden md:inline">{opt.label}</span>
                          </button>
                        ))}
                     </div>

                    <button onClick={resetAll} className="px-6 py-2 rounded-lg text-[11px] font-bold border border-transparent text-neutral-500 hover:text-red-400 hover:bg-red-900/10 transition-all flex items-center gap-2">
                      <X size={14} /> Clear Filters
                    </button>
                  </div>

                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Sub components remain unchanged...
function SortSelect({ value, onChange }: { value: string, onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const options = [
    { label: "Rank", value: "rank" },
    { label: "Date", value: "date" },
    { label: "Popularity", value: "collected" },
  ];

  const currentLabel = options.find(o => o.value === value)?.label;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <div className="relative flex items-center gap-3 z-50" ref={ref}>
       <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">Sort By</span>
       <div className="relative w-[140px]">
         <button 
           onClick={() => setOpen(!open)}
           className={`w-full flex items-center justify-between px-3 py-2 rounded-lg border text-xs font-bold transition-all ${open ? "bg-neutral-800 text-white border-neutral-700" : "bg-neutral-900/50 border-neutral-800 text-neutral-300 hover:border-neutral-700"}`}
         >
            <span>{currentLabel}</span>
            <ChevronDown size={12} className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
         </button>

         <AnimatePresence>
           {open && (
             <motion.div
               initial={{ opacity: 0, y: 2, scale: 0.98 }}
               animate={{ opacity: 1, y: 0, scale: 1 }}
               exit={{ opacity: 0, y: 2, scale: 0.98 }}
               transition={{ duration: 0.1 }}
               className="absolute top-full left-0 right-0 mt-1 bg-neutral-900 border border-neutral-800 rounded-lg shadow-xl overflow-hidden py-1 z-50"
             >
               {options.map(opt => (
                 <button
                   key={opt.value}
                   onClick={() => { onChange(opt.value); setOpen(false); }}
                   className={`w-full text-left px-3 py-2 text-xs font-bold transition-colors flex items-center justify-between ${value === opt.value ? "text-pink-500 bg-pink-500/10" : "text-neutral-400 hover:text-white hover:bg-neutral-800"}`}
                 >
                   {opt.label}
                   {value === opt.value && <Check size={12} />}
                 </button>
               ))}
             </motion.div>
           )}
         </AnimatePresence>
       </div>
    </div>
  );
}

interface FilterInputGroupProps {
  icon: React.ReactNode;
  label: string;
  min: number;
  max: number;
  limitMin: number;
  limitMax: number;
  onMin: (val: number) => void;
  onMax: (val: number) => void;
  step?: number;
  active?: boolean;
}

function FilterInputGroup({ icon, label, min, max, limitMin, limitMax, onMin, onMax, step = 1, active = false }: FilterInputGroupProps) {
  return (
    <div className={`relative flex flex-col gap-2 p-3 rounded-xl border transition-all duration-300 group ${active ? "bg-pink-900/5 border-pink-500/30" : "bg-neutral-900/30 border-neutral-800 hover:border-neutral-700"}`}>
      <div className={`flex items-center gap-2 transition-colors ${active ? "text-pink-400" : "text-neutral-500 group-hover:text-neutral-400"}`}>
        {icon} <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        <Input 
          val={min} 
          onChange={onMin} 
          step={step} 
          min={limitMin}
          max={limitMax}
        />
        <span className="text-neutral-700 font-light">/</span>
        <Input 
          val={max} 
          onChange={onMax} 
          step={step} 
          min={limitMin}
          max={limitMax}
        />
      </div>
      {active && <div className="absolute inset-0 border border-pink-500/20 rounded-xl pointer-events-none animate-pulse" />}
    </div>
  );
}

function Input({ val, onChange, step, min, max }: { val: number, onChange: (v: number) => void, step: number, min: number, max: number }) {
  const [localVal, setLocalVal] = useState(val.toString());

  useEffect(() => {
    // Only update local value if prop changes significantly (avoid overwriting user typing if they are slow?)
    // Actually, we should sync always unless focused. 
    // But simplified: Sync when prop changes.
    setLocalVal(val.toString());
  }, [val]);

  const commit = () => {
    let num = parseFloat(localVal);
    if (isNaN(num)) num = min;
    
    // Check if changed before calling onChange to avoid re-sort
    if (num !== val) {
      onChange(num);
    } else {
      // If invalid string but same number, revert visual
      setLocalVal(val.toString());
    }
  };

  return (
    <input 
      type="number" 
      step={step}
      value={localVal}
      onChange={(e) => setLocalVal(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => e.key === 'Enter' && commit()}
      className="w-full bg-neutral-950/50 border border-neutral-800 rounded-lg px-2 py-1.5 text-xs text-white text-center focus:outline-none focus:border-pink-500/40 focus:bg-neutral-950 font-mono transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none placeholder:text-neutral-700" 
    />
  );
}