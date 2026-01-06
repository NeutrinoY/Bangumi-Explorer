"use client";

import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY_V1 = "bangumi_collection_v1";
const STORAGE_KEY_V2 = "bangumi_collection_v2";

export type ItemStatus = 'collected' | 'wishlist' | 'ignored';

interface CollectionStore {
  [id: number]: ItemStatus;
}

export function useCollection() {
  const [collection, setCollection] = useState<CollectionStore>({});
  const [isLoaded, setIsLoaded] = useState(false);

  // Load & Migrate
  useEffect(() => {
    try {
      const v2Data = localStorage.getItem(STORAGE_KEY_V2);
      
      if (v2Data) {
        // Load V2 directly
        setCollection(JSON.parse(v2Data));
      } else {
        // Try Migrate V1
        const v1Data = localStorage.getItem(STORAGE_KEY_V1);
        if (v1Data) {
          const ids = JSON.parse(v1Data);
          const newCollection: CollectionStore = {};
          if (Array.isArray(ids)) {
            ids.forEach((id: number) => {
              newCollection[id] = 'collected';
            });
          }
          setCollection(newCollection);
          // Save immediately to V2
          localStorage.setItem(STORAGE_KEY_V2, JSON.stringify(newCollection));
        }
      }
    } catch (e) {
      console.error("Failed to load collection", e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  const save = (newCollection: CollectionStore) => {
    try {
      localStorage.setItem(STORAGE_KEY_V2, JSON.stringify(newCollection));
      setCollection(newCollection);
    } catch (e) {
      console.error("Failed to save collection", e);
    }
  };

  // status: pass null to remove (reset to Normal)
  const updateStatus = useCallback((id: number, status: ItemStatus | null) => {
    setCollection((prev) => {
      const next = { ...prev };
      if (status === null) {
        delete next[id];
      } else {
        next[id] = status;
      }
      save(next);
      return next;
    });
  }, []);

  const getStatus = useCallback(
    (id: number): ItemStatus | null => {
      return collection[id] || null;
    },
    [collection]
  );

  return { collection, updateStatus, getStatus, isLoaded };
}