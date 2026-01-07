"use client";

import { useBangumiData, type BangumiSubject } from "@/hooks/useBangumiData";
import { useCollection } from "@/hooks/useCollection";
import { AnimeCard } from "@/components/AnimeCard";
import { FilterPanel, type StatusFilterType } from "@/components/FilterPanel";
import { AnimeDetailModal } from "@/components/AnimeDetailModal";
import { LoginModal } from "@/components/LoginModal";
import { useAdmin } from "@/hooks/useAdmin";
import { useState, useMemo, useEffect, Suspense } from "react";
import { ChevronLeft, ChevronRight, Search, Lock, Unlock } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import { useUrlSync } from "@/hooks/useUrlSync";

const INITIAL_FILTERS = {
  year: [0, 2030] as [number, number],
  score: [0, 10] as [number, number],
  rank: [0, 99999] as [number, number],
  votes: [0, 999999] as [number, number],
  eps: [0, 9999] as [number, number],
};

function BangumiExplorer() {
  const { data, loading } = useBangumiData();
  const { getStatus, updateStatus, isLoaded: isCollectionLoaded } = useCollection();
  const { isAdmin, login, logout } = useAdmin();

  const [selectedItem, setSelectedItem] = useState<BangumiSubject | null>(null);
  const [showLogin, setShowLogin] = useState(false);

  // --- Filter States ---
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [selectedTypes, setSelectedTypes] = useState<Set<string>>(new Set(["TV", "Movie", "OVA", "Web"]));
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilterType>('all');
  const [sortBy, setSortBy] = useState("rank");
  const [selectedSeason, setSelectedSeason] = useState<number | null>(null);

  // Pagination
  const [page, setPage] = useState(1);
  const pageSize = 60;

  // --- URL Sync ---
  useUrlSync(
    filters, setFilters,
    selectedTypes, setSelectedTypes,
    searchText, setSearchText,
    statusFilter, setStatusFilter,
    sortBy, setSortBy,
    page, setPage
  );

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

  const applyFilters = (newFilters: Partial<typeof INITIAL_FILTERS>, newTypes?: Set<string>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    if (newTypes) setSelectedTypes(newTypes);
    setPage(1);
  };

  const resetAll = () => {
    setFilters(INITIAL_FILTERS);
    setSelectedTypes(new Set(["TV", "Movie", "OVA", "Web"]));
    setSearchText("");
    setStatusFilter('all');
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
        // 1. Status Filter
        const status = getStatus(item.id);
        if (statusFilter === 'todo') {
          if (status === 'collected' || status === 'ignored') return false;
        } else if (statusFilter === 'collected') {
          if (status !== 'collected') return false;
        } else if (statusFilter === 'ignored') {
          if (status !== 'ignored') return false;
        }

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
  }, [data, filters, selectedTypes, searchText, statusFilter, getStatus, sortBy, selectedSeason]);

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
        applyFilters={applyFilters}
        selectedTypes={selectedTypes} toggleType={toggleType}
        searchText={searchText} setSearchText={setSearchText}
        statusFilter={statusFilter} setStatusFilter={setStatusFilter}
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
                    status={getStatus(item.id)}
                    onUpdateStatus={updateStatus}
                    isAdmin={isAdmin}
                  />
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row justify-center items-center gap-6 mt-16">
                
                <div className="flex items-center gap-4">
                  <button
                    disabled={page === 1}
                    onClick={() => setPage(p => p - 1)}
                    className="p-3 rounded-full border border-neutral-800 bg-neutral-900 text-white disabled:opacity-20 hover:border-pink-500 transition-all"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  
                  <div className="flex items-center gap-2 min-w-[100px] justify-center">
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

                {/* Jump to Page */}
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    const form = e.target as HTMLFormElement;
                    const input = form.elements.namedItem('page') as HTMLInputElement;
                    let val = parseInt(input.value);
                    if (isNaN(val)) return;
                    if (val < 1) val = 1;
                    if (val > totalPages) val = totalPages;
                    setPage(val);
                    input.value = '';
                  }}
                  className="flex items-center gap-2 pl-6 border-l border-neutral-800"
                >
                  <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Go to</span>
                  <input 
                    name="page"
                    type="number" 
                    min={1} 
                    max={totalPages}
                    placeholder="#"
                    className="w-12 bg-neutral-900 border border-neutral-800 rounded px-2 py-1.5 text-xs text-center text-white focus:outline-none focus:border-pink-500 font-mono [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none placeholder:text-neutral-700"
                  />
                  <button type="submit" className="p-1.5 rounded bg-neutral-800 text-neutral-400 hover:bg-neutral-700 hover:text-white transition-colors">
                    <ChevronRight size={14} />
                  </button>
                </form>

              </div>
            )}
          </>
        )}
      </div>

      <AnimatePresence>
        {selectedItem && (
          <AnimeDetailModal
            item={selectedItem}
            onClose={() => setSelectedItem(null)}
            status={getStatus(selectedItem.id)}
            onUpdateStatus={updateStatus}
            isAdmin={isAdmin}
          />
        )}
      </AnimatePresence>

      {/* Admin Toggle */}
      <div className="fixed bottom-4 right-4 z-50 opacity-30 hover:opacity-100 transition-opacity">
        <button 
          onClick={() => isAdmin ? logout() : setShowLogin(true)}
          className="p-2 bg-black/50 hover:bg-neutral-800 border border-neutral-700 rounded-full text-neutral-500 hover:text-white transition-all shadow-lg"
          title={isAdmin ? "Logout" : "Admin Login"}
        >
          {isAdmin ? <Unlock size={14} /> : <Lock size={14} />}
        </button>
      </div>

      <LoginModal isOpen={showLogin} onClose={() => setShowLogin(false)} onLogin={login} />

    </main>
  );
}

export default function Home() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white gap-4 font-mono">
        <div className="w-8 h-8 border-2 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <BangumiExplorer />
    </Suspense>
  );
}
