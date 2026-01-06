"use client";

import { useBangumiData, type BangumiSubject } from "@/hooks/useBangumiData";
import { useCollection } from "@/hooks/useCollection";
import { AnimeCard } from "@/components/AnimeCard";
import { FilterPanel } from "@/components/FilterPanel";
import { AnimeDetailModal } from "@/components/AnimeDetailModal";
import { useState, useMemo, useEffect } from "react";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";

const INITIAL_FILTERS = {
  year: [1901, 2026] as [number, number],
  score: [0, 10] as [number, number],
  rank: [0, 99999] as [number, number],
  votes: [0, 999999] as [number, number],
  eps: [0, 9999] as [number, number],
};

export default function Home() {
  const { data, loading } = useBangumiData();
  const { collectedIds, toggle, isLoaded: isCollectionLoaded } = useCollection();

  const [selectedItem, setSelectedItem] = useState<BangumiSubject | null>(null);

  // --- Filter States ---
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [selectedTypes, setSelectedTypes] = useState<Set<string>>(new Set(["TV", "Movie", "OVA"]));
  const [searchText, setSearchText] = useState("");
  const [hideCollected, setHideCollected] = useState(false);
  const [sortBy, setSortBy] = useState("rank");
  const [selectedSeason, setSelectedSeason] = useState<number | null>(null);

  // Pagination
  const [page, setPage] = useState(1);
  const pageSize = 60;

  useEffect(() => {
    if (filters.year[0] !== filters.year[1]) setSelectedSeason(null);
  }, [filters.year]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [page]);

  const setSingleFilter = (key: string, val: [number, number]) => {
    setFilters(prev => ({ ...prev, [key]: val }));
    setPage(1); 
  };

  const resetAll = () => {
    setFilters(INITIAL_FILTERS);
    setSelectedTypes(new Set(["TV", "Movie", "OVA"]));
    setSearchText("");
    setHideCollected(false);
    setSelectedSeason(null);
    setSortBy("rank");
    setPage(1);
  };

  const toggleType = (t: string) => {
    const next = new Set(selectedTypes);
    if (next.has(t)) next.delete(t); else next.add(t);
    setSelectedTypes(next);
    setPage(1);
  };

  const filteredData = useMemo(() => {
    if (!data.length) return [];
    const query = searchText.toLowerCase().trim();

    return data
      .filter((item) => {
        if ((item.score || 0) < filters.score[0] || (item.score || 0) > filters.score[1]) return false;
        
        const r = (item.rank && item.rank > 0) ? item.rank : 999999;
        if (r < filters.rank[0] || r > filters.rank[1]) return false;

        const v = item.total || 0;
        if (v < filters.votes[0] || v > filters.votes[1]) return false;

        const y = item.year || 0;
        if (y < filters.year[0] || y > filters.year[1]) return false;

        const e = item.eps || 0;
        if (e < filters.eps[0] || e > filters.eps[1]) return false;

        if (selectedSeason !== null && filters.year[0] === filters.year[1]) {
          const m = item.month || 0;
          if (m < selectedSeason || m > selectedSeason + 2) return false;
        }

        if (selectedTypes.size > 0 && item.type) {
           let match = false;
           for (const t of Array.from(selectedTypes)) {
             if (item.type.toLowerCase().includes(t.toLowerCase())) { match = true; break; }
           }
           if (!match) return false;
        }

        if (hideCollected && collectedIds.has(item.id)) return false;

        if (query) {
          const inName = (item.name || "").toLowerCase().includes(query);
          const inCn = (item.cn || "").toLowerCase().includes(query);
          const inStudio = (item.studio || "").toLowerCase().includes(query);
          const inId = item.id.toString() === query;
          if (!inName && !inCn && !inStudio && !inId) return false;
        }

        return true;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case "score": return (b.score || 0) - (a.score || 0);
          case "date": return (b.date || "").localeCompare(a.date || "");
          case "collected": return (b.collection?.collect || 0) - (a.collection?.collect || 0);
          case "rank":
          default:
            const ra = (a.rank && a.rank > 0) ? a.rank : 999999;
            const rb = (b.rank && b.rank > 0) ? b.rank : 999999;
            if (ra !== rb) return ra - rb;
            return (b.score || 0) - (a.score || 0);
        }
      });
  }, [data, filters, selectedTypes, searchText, hideCollected, collectedIds, sortBy, selectedSeason]);

  const totalPages = Math.ceil(filteredData.length / pageSize);
  const visibleData = filteredData.slice((page - 1) * pageSize, page * pageSize);

  if (loading || !isCollectionLoaded) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white gap-4 font-mono">
        <div className="w-8 h-8 border-2 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
        <div className="text-xs text-neutral-500 animate-pulse uppercase tracking-widest">Reloading Database...</div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-300 font-sans selection:bg-pink-500 selection:text-white pb-20">
      <FilterPanel
        filters={filters} setFilter={setSingleFilter} resetAll={resetAll}
        selectedTypes={selectedTypes} toggleType={toggleType}
        searchText={searchText} setSearchText={setSearchText}
        hideCollected={hideCollected} setHideCollected={setHideCollected}
        selectedSeason={selectedSeason} setSelectedSeason={setSelectedSeason}
        sortBy={sortBy} setSortBy={setSortBy}
        totalCount={data.length} showingCount={filteredData.length}
      />

      <div className="max-w-[1920px] mx-auto p-4 sm:p-6">
        {visibleData.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-neutral-600 gap-4">
            <Search size={48} strokeWidth={1} />
            <p>No results match your criteria.</p>
            <button onClick={resetAll} className="text-pink-500 hover:underline text-sm font-bold uppercase tracking-widest">RESET ALL FILTERS</button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
              {visibleData.map((item) => (
                <div key={item.id} onClick={() => setSelectedItem(item)} className="cursor-pointer">
                  <AnimeCard
                    item={item}
                    isCollected={collectedIds.has(item.id)}
                    onToggle={(id) => toggle(id)}
                  />
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 mt-12">
                <button
                  disabled={page === 1}
                  onClick={() => setPage(p => p - 1)}
                  className="p-3 rounded-full border border-neutral-800 bg-neutral-900 text-white disabled:opacity-20 hover:border-pink-500 transition-all"
                >
                  <ChevronLeft size={20} />
                </button>
                
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-neutral-500 uppercase tracking-widest">Page</span>
                  <span className="text-lg font-mono text-white font-bold">{page}</span>
                  <span className="text-xs font-bold text-neutral-500 uppercase tracking-widest">of {totalPages}</span>
                </div>

                <button
                  disabled={page === totalPages}
                  onClick={() => setPage(p => p + 1)}
                  className="p-3 rounded-full border border-neutral-800 bg-neutral-900 text-white disabled:opacity-20 hover:border-pink-500 transition-all"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {selectedItem && (
        <AnimeDetailModal
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
          isCollected={collectedIds.has(selectedItem.id)}
          onToggle={toggle}
        />
      )}
    </main>
  );
}