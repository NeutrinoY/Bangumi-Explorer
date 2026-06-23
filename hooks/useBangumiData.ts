"use client";

import { useEffect, useState } from "react";
import type { BangumiSubject } from "@/features/explorer/state";

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
