"use client";

import { useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { StatusFilterType } from "@/components/FilterPanel";

interface Filters {
  year: [number, number];
  score: [number, number];
  rank: [number, number];
  votes: [number, number];
  eps: [number, number];
}

export function useUrlSync(
  filters: Filters, setFilters: (f: Filters) => void,
  selectedTypes: Set<string>, setSelectedTypes: (t: Set<string>) => void,
  searchText: string, setSearchText: (s: string) => void,
  statusFilter: StatusFilterType, setStatusFilter: (s: StatusFilterType) => void,
  sortBy: string, setSortBy: (s: string) => void,
  page: number, setPage: (p: number) => void
) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isInitialized = useRef(false);

  // 1. Load from URL on mount
  useEffect(() => {
    if (isInitialized.current) return;
    
    const params = new URLSearchParams(window.location.search);
    let hasChanges = false;

    // Helper to parse range "min-max"
    const parseRange = (key: string, defaultRange: [number, number]): [number, number] => {
      const val = params.get(key);
      if (!val) return defaultRange;
      const [min, max] = val.split('-').map(Number);
      if (!isNaN(min) && !isNaN(max)) return [min, max];
      return defaultRange;
    };

    // Filters
    const newFilters = { ...filters };
    const y = parseRange('y', filters.year);
    const s = parseRange('s', filters.score);
    const r = parseRange('r', filters.rank);
    const v = parseRange('v', filters.votes);
    const e = parseRange('e', filters.eps);

    if (y[0] !== filters.year[0] || y[1] !== filters.year[1]) { newFilters.year = y; hasChanges = true; }
    if (s[0] !== filters.score[0] || s[1] !== filters.score[1]) { newFilters.score = s; hasChanges = true; }
    if (r[0] !== filters.rank[0] || r[1] !== filters.rank[1]) { newFilters.rank = r; hasChanges = true; }
    if (v[0] !== filters.votes[0] || v[1] !== filters.votes[1]) { newFilters.votes = v; hasChanges = true; }
    if (e[0] !== filters.eps[0] || e[1] !== filters.eps[1]) { newFilters.eps = e; hasChanges = true; }

    if (hasChanges) setFilters(newFilters);

    // Types
    const t = params.get('t');
    if (t) {
      const types = new Set(t.split(','));
      setSelectedTypes(types);
    }

    // Search
    const q = params.get('q');
    if (q) setSearchText(q);

    // Status
    const st = params.get('st');
    if (st && ['todo', 'collected', 'ignored', 'all'].includes(st)) {
      setStatusFilter(st as StatusFilterType);
    }

    // Sort
    const sort = params.get('sort');
    if (sort) setSortBy(sort);

    // Page
    const p = params.get('p');
    if (p) setPage(parseInt(p));

    isInitialized.current = true;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run once on mount

  // 2. Sync to URL on change
  useEffect(() => {
    if (!isInitialized.current) return;

    const params = new URLSearchParams();

    // Filters
    if (filters.year[0] !== 0 || filters.year[1] !== 2030) params.set('y', filters.year.join('-'));
    if (filters.score[0] !== 0 || filters.score[1] !== 10) params.set('s', filters.score.join('-'));
    if (filters.rank[0] !== 0 || filters.rank[1] !== 99999) params.set('r', filters.rank.join('-'));
    if (filters.votes[0] !== 0 || filters.votes[1] !== 999999) params.set('v', filters.votes.join('-'));
    if (filters.eps[0] !== 0 || filters.eps[1] !== 9999) params.set('e', filters.eps.join('-'));

    // Types (Default is TV,Movie,OVA,Web)
    const defaultTypes = ["TV", "Movie", "OVA", "Web"];
    const currentTypes = Array.from(selectedTypes);
    const isDefaultTypes = currentTypes.length === defaultTypes.length && defaultTypes.every(t => selectedTypes.has(t));
    if (!isDefaultTypes) params.set('t', currentTypes.join(','));

    // Search
    if (searchText) params.set('q', searchText);

    // Status
    if (statusFilter !== 'todo') params.set('st', statusFilter);

    // Sort
    if (sortBy !== 'rank') params.set('sort', sortBy);

    // Page
    if (page > 1) params.set('p', page.toString());

    // Update URL
    router.replace(`?${params.toString()}`, { scroll: false });

  }, [filters, selectedTypes, searchText, statusFilter, sortBy, page, router]);
}
