"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useAdmin } from "@/hooks/useAdmin";

export type ItemStatus = 'collected' | 'wishlist' | 'ignored';

interface CollectionStore {
  [id: number]: ItemStatus;
}

const ADMIN_UID = process.env.NEXT_PUBLIC_ADMIN_UID;

export function useCollection() {
  const { user, isAuthLoaded } = useAdmin();
  const [collection, setCollection] = useState<CollectionStore>({});
  const [isLoaded, setIsLoaded] = useState(false);

  // Load Data (Always load Admin's collection)
  useEffect(() => {
    if (!ADMIN_UID) return;

    const loadData = async () => {
      try {
        const { data, error } = await supabase
          .from('user_collections')
          .select('subject_id, status')
          .eq('user_id', ADMIN_UID);

        if (error) throw error;

        const cloudStore: CollectionStore = {};
        if (data) {
          data.forEach((row: any) => {
            cloudStore[row.subject_id] = row.status as ItemStatus;
          });
        }
        setCollection(cloudStore);
      } catch (e) {
        console.error("Failed to load collection:", e);
      } finally {
        setIsLoaded(true);
      }
    };

    loadData();
    
    // Optional: Realtime Subscription? 
    // If you edit on phone, PC updates automatically.
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_collections',
          filter: `user_id=eq.${ADMIN_UID}`,
        },
        (payload) => {
           // Simple reload or manual update
           loadData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };

  }, []);

  // Update Status (Only if logged in as Admin)
  const updateStatus = useCallback(async (id: number, status: ItemStatus | null) => {
    // 1. Check permissions
    if (!user || user.id !== ADMIN_UID) {
      console.warn("Unauthorized: Cannot update collection.");
      return;
    }

    // 2. Optimistic Update
    setCollection((prev) => {
      const next = { ...prev };
      if (status === null) {
        delete next[id];
      } else {
        next[id] = status;
      }
      return next;
    });

    // 3. Cloud Sync
    if (status === null) {
      // Delete
      const { error } = await supabase
        .from('user_collections')
        .delete()
        .eq('user_id', user.id) // Security double-check
        .eq('subject_id', id);
      
      if (error) console.error("Cloud delete failed:", error);
    } else {
      // Upsert
      const { error } = await supabase
        .from('user_collections')
        .upsert({
          user_id: user.id,
          subject_id: id,
          status: status
        }, { onConflict: 'user_id, subject_id' });
      
      if (error) console.error("Cloud upsert failed:", JSON.stringify(error, null, 2));
    }

  }, [user]);

  const getStatus = useCallback(
    (id: number): ItemStatus | null => {
      return collection[id] || null;
    },
    [collection]
  );

  return { collection, updateStatus, getStatus, isLoaded };
}