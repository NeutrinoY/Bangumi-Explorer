"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import {
  type ExplorerFilters,
  parseExplorerState,
  type SortKey,
  type StatusFilterType,
  serializeExplorerState,
} from "@/features/explorer/state";

export function useUrlSync(
  filters: ExplorerFilters,
  setFilters: (f: ExplorerFilters) => void,
  selectedTypes: Set<string>,
  setSelectedTypes: (t: Set<string>) => void,
  searchText: string,
  setSearchText: (s: string) => void,
  statusFilter: StatusFilterType,
  setStatusFilter: (s: StatusFilterType) => void,
  sortBy: SortKey,
  setSortBy: (s: SortKey) => void,
  page: number,
  setPage: (p: number) => void,
) {
  const router = useRouter();
  const isInitialized = useRef(false);

  // 1. Load from URL on mount
  useEffect(() => {
    if (isInitialized.current) return;

    const state = parseExplorerState(window.location.search);
    setFilters(state.filters);
    setSelectedTypes(state.selectedTypes);
    setSearchText(state.searchText);
    setStatusFilter(state.statusFilter);
    setSortBy(state.sortBy);
    setPage(state.page);
    isInitialized.current = true;
  }, [setFilters, setPage, setSearchText, setSelectedTypes, setSortBy, setStatusFilter]);

  // 2. Sync to URL on change
  useEffect(() => {
    if (!isInitialized.current) return;

    const params = serializeExplorerState({
      filters,
      selectedTypes,
      searchText,
      statusFilter,
      sortBy,
      selectedSeason: null,
      page,
    });
    router.replace(`?${params.toString()}`, { scroll: false });
  }, [filters, selectedTypes, searchText, statusFilter, sortBy, page, router]);
}
