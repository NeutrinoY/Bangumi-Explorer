"use client";

import { useState, useEffect } from "react";

export interface BangumiSubject {
  id: number;
  name: string;
  cn: string;
  img: string;
  summary: string;
  // Date
  date: string;
  year: number;
  month: number;
  // Specs
  type: string;
  eps: number;
  total_eps: number;
  // Metrics
  score: number;
  rank: number;
  total: number;
  score_chart: Record<string, number>;
  collection: {
    wish: number;
    collect: number;
    doing: number;
    on_hold: number;
    dropped: number;
  };
  // Staff
  studio: string;
  director: string;
  writer: string;
  music: string;
  char_design: string;
  original: string;
  // Meta
  tags: string[];
  sites: { site: string; id: string }[];
}

export function useBangumiData() {
  const [data, setData] = useState<BangumiSubject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await fetch("/db.json");
        const json = await res.json();
        setData(json);
      } catch (e) {
        console.error("Failed to load database:", e);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  return { data, loading };
}