"use client";

import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "bangumi_collection_v1";

export function useCollection() {
  const [collectedIds, setCollectedIds] = useState<Set<number>>(new Set());
  const [isLoaded, setIsLoaded] = useState(false);

  // 初始化加载
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setCollectedIds(new Set(JSON.parse(stored)));
      }
    } catch (e) {
      console.error("Failed to load collection", e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // 保存到 LocalStorage
  const save = (newSet: Set<number>) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(newSet)));
      setCollectedIds(newSet);
    } catch (e) {
      console.error("Failed to save collection", e);
    }
  };

  const toggle = useCallback((id: number) => {
    setCollectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      save(next);
      return next;
    });
  }, []);

  const has = useCallback(
    (id: number) => collectedIds.has(id),
    [collectedIds]
  );

  return { collectedIds, toggle, has, isLoaded };
}
