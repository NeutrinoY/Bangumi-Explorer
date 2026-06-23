"use client";

import { ChevronLeft, ChevronRight, Lock, Search, Unlock } from "lucide-react";
import { AnimatePresence } from "motion/react";
import { Suspense, useEffect, useMemo, useState } from "react";
import { AnimeCard } from "@/components/AnimeCard";
import { AnimeDetailModal } from "@/components/AnimeDetailModal";
import { FilterPanel, type StatusFilterType } from "@/components/FilterPanel";
import { LoginModal } from "@/components/LoginModal";
import {
  type BangumiSubject,
  DEFAULT_EXPLORER_FILTERS,
  filterSubjects,
  getVisibleSubjects,
  type SortKey,
  sortSubjects,
} from "@/features/explorer/state";
import { useAdmin } from "@/hooks/useAdmin";
import { useBangumiData } from "@/hooks/useBangumiData";
import { useCollection } from "@/hooks/useCollection";
import { useUrlSync } from "@/hooks/useUrlSync";

function BangumiExplorer() {
  const { data, loading } = useBangumiData();
  const { getStatus, updateStatus, isLoaded: isCollectionLoaded } = useCollection();
  const { isAdmin, login, logout } = useAdmin();

  const [selectedItem, setSelectedItem] = useState<BangumiSubject | null>(null);
  const [showLogin, setShowLogin] = useState(false);

  // --- Filter States ---
  const [filters, setFilters] = useState(DEFAULT_EXPLORER_FILTERS);
  const [selectedTypes, setSelectedTypes] = useState<Set<string>>(
    new Set(["TV", "Movie", "OVA", "Web"]),
  );
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilterType>("all");
  const [sortBy, setSortBy] = useState<SortKey>("rank");
  const [selectedSeason, setSelectedSeason] = useState<number | null>(null);

  // Pagination
  const [page, setPage] = useState(1);
  const pageSize = 60;

  // --- URL Sync ---
  useUrlSync(
    filters,
    setFilters,
    selectedTypes,
    setSelectedTypes,
    searchText,
    setSearchText,
    statusFilter,
    setStatusFilter,
    sortBy,
    setSortBy,
    page,
    setPage,
  );

  useEffect(() => {
    if (filters.year[0] !== filters.year[1]) setSelectedSeason(null);
  }, [filters.year]);

  useEffect(() => {
    if (page < 1) return;
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [page]);

  const setSingleFilter = (key: string, val: [number, number]) => {
    setFilters((prev) => ({ ...prev, [key]: val }));
    setPage(1);
  };

  const applyFilters = (
    newFilters: Partial<typeof DEFAULT_EXPLORER_FILTERS>,
    newTypes?: Set<string>,
  ) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    if (newTypes) setSelectedTypes(newTypes);
    setPage(1);
  };

  const resetAll = () => {
    setFilters(DEFAULT_EXPLORER_FILTERS);
    setSelectedTypes(new Set(["TV", "Movie", "OVA", "Web"]));
    setSearchText("");
    setStatusFilter("all");
    setSelectedSeason(null);
    setSortBy("rank");
    setPage(1);
  };

  const toggleType = (t: string) => {
    const next = new Set(selectedTypes);
    if (next.has(t)) next.delete(t);
    else next.add(t);
    setSelectedTypes(next);
    setPage(1);
  };

  const filteredData = useMemo(() => {
    if (!data.length) return [];
    return sortSubjects(
      filterSubjects(
        data,
        { filters, selectedTypes, searchText, statusFilter, sortBy, selectedSeason, page },
        getStatus,
      ),
      sortBy,
    );
  }, [
    data,
    filters,
    selectedTypes,
    searchText,
    statusFilter,
    getStatus,
    sortBy,
    selectedSeason,
    page,
  ]);

  const totalPages = Math.ceil(filteredData.length / pageSize);
  const visibleData = getVisibleSubjects(filteredData, page, pageSize);

  if (loading || !isCollectionLoaded) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white gap-4 font-mono">
        <div className="w-8 h-8 border-2 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
        <div className="text-xs text-neutral-500 animate-pulse uppercase tracking-widest">
          Reloading Database...
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-300 font-sans selection:bg-pink-500 selection:text-white pb-20">
      <FilterPanel
        filters={filters}
        setFilter={setSingleFilter}
        resetAll={resetAll}
        applyFilters={applyFilters}
        selectedTypes={selectedTypes}
        toggleType={toggleType}
        searchText={searchText}
        setSearchText={setSearchText}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        selectedSeason={selectedSeason}
        setSelectedSeason={setSelectedSeason}
        sortBy={sortBy}
        setSortBy={setSortBy}
        showingCount={filteredData.length}
      />

      <div className="max-w-[1920px] mx-auto p-4 sm:p-6">
        {visibleData.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-neutral-600 gap-4">
            <Search size={48} strokeWidth={1} />
            <p>No results match your criteria.</p>
            <button
              type="button"
              onClick={resetAll}
              className="text-pink-500 hover:underline text-sm font-bold uppercase tracking-widest"
            >
              RESET ALL FILTERS
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
              {visibleData.map((item, index) => (
                // biome-ignore lint/a11y/useSemanticElements: The card can contain admin buttons, so a native button wrapper would create nested interactive elements.
                <div
                  key={item.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => setSelectedItem(item)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      setSelectedItem(item);
                    }
                  }}
                  className="cursor-pointer"
                >
                  <AnimeCard
                    item={item}
                    status={getStatus(item.id)}
                    onUpdateStatus={updateStatus}
                    isAdmin={isAdmin}
                    priority={index < 8}
                  />
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row justify-center items-center gap-6 mt-16">
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    disabled={page === 1}
                    onClick={() => setPage((p) => p - 1)}
                    className="p-3 rounded-full border border-neutral-800 bg-neutral-900 text-white disabled:opacity-20 hover:border-pink-500 transition-all"
                  >
                    <ChevronLeft size={20} />
                  </button>

                  <div className="flex items-center gap-2 min-w-[100px] justify-center">
                    <span className="text-xs font-bold text-neutral-500 uppercase tracking-widest">
                      Page
                    </span>
                    <span className="text-lg font-mono text-white font-bold">{page}</span>
                    <span className="text-xs font-bold text-neutral-500 uppercase tracking-widest">
                      of {totalPages}
                    </span>
                  </div>

                  <button
                    type="button"
                    disabled={page === totalPages}
                    onClick={() => setPage((p) => p + 1)}
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
                    const input = form.elements.namedItem("page") as HTMLInputElement;
                    let val = Number.parseInt(input.value, 10);
                    if (Number.isNaN(val)) return;
                    if (val < 1) val = 1;
                    if (val > totalPages) val = totalPages;
                    setPage(val);
                    input.value = "";
                  }}
                  className="flex items-center gap-2 pl-6 border-l border-neutral-800"
                >
                  <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">
                    Go to
                  </span>
                  <input
                    name="page"
                    type="number"
                    min={1}
                    max={totalPages}
                    placeholder="#"
                    className="w-12 bg-neutral-900 border border-neutral-800 rounded px-2 py-1.5 text-xs text-center text-white focus:outline-none focus:border-pink-500 font-mono [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none placeholder:text-neutral-700"
                  />
                  <button
                    type="submit"
                    className="p-1.5 rounded bg-neutral-800 text-neutral-400 hover:bg-neutral-700 hover:text-white transition-colors"
                  >
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
          type="button"
          onClick={() => (isAdmin ? logout() : setShowLogin(true))}
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
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white gap-4 font-mono">
          <div className="w-8 h-8 border-2 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      }
    >
      <BangumiExplorer />
    </Suspense>
  );
}
