"use client";

import { useCallback, useEffect, useState } from "react";
import {
  applyCollectionStatus,
  type CollectionRow,
  type CollectionStore,
  type ItemStatus,
  isAdminUser,
  parseCollectionRows,
} from "@/features/collection/state";
import { useAdmin } from "@/hooks/useAdmin";
import { supabase } from "@/lib/supabaseClient";

const ADMIN_UID = process.env.NEXT_PUBLIC_ADMIN_UID;

export type { ItemStatus };

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (error && typeof error === "object") {
    const candidate = error as {
      message?: unknown;
      code?: unknown;
      details?: unknown;
      hint?: unknown;
    };
    return [candidate.code, candidate.message, candidate.details, candidate.hint]
      .filter(Boolean)
      .join(" | ");
  }
  return String(error);
}

export function useCollection() {
  const { user } = useAdmin();
  const [collection, setCollection] = useState<CollectionStore>({});
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load Data (Always load Admin's collection)
  useEffect(() => {
    if (!ADMIN_UID) return;

    const loadData = async () => {
      try {
        const { data, error } = await supabase
          .from("user_collections")
          .select("subject_id, status")
          .eq("user_id", ADMIN_UID);

        if (error) throw error;

        setCollection(parseCollectionRows(data as CollectionRow[] | null));
        setError(null);
      } catch (e) {
        const message = getErrorMessage(e);
        console.error("Failed to load collection:", message || e);
        setError(message || "Failed to load collection.");
      } finally {
        setIsLoaded(true);
      }
    };

    loadData();

    // Optional: Realtime Subscription?
    // If you edit on phone, PC updates automatically.
    const channel = supabase
      .channel("schema-db-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "user_collections",
          filter: `user_id=eq.${ADMIN_UID}`,
        },
        () => {
          loadData();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Update Status (Only if logged in as Admin)
  const updateStatus = useCallback(
    async (id: number, status: ItemStatus | null) => {
      // 1. Check permissions
      if (!isAdminUser(user, ADMIN_UID)) {
        console.warn("Unauthorized: Cannot update collection.");
        setError("Unauthorized: Cannot update collection.");
        return;
      }

      // 2. Optimistic Update
      const previous = collection;
      setCollection((prev) => applyCollectionStatus(prev, id, status));
      setError(null);

      // 3. Cloud Sync
      try {
        if (status === null) {
          const { error } = await supabase
            .from("user_collections")
            .delete()
            // RLS remains the real security boundary; this client-side check keeps UI state honest.
            .eq("user_id", user.id)
            .eq("subject_id", id);

          if (error) throw error;
        } else {
          const { error } = await supabase.from("user_collections").upsert(
            {
              user_id: user.id,
              subject_id: id,
              status,
            },
            { onConflict: "user_id, subject_id" },
          );

          if (error) throw error;
        }
      } catch (e) {
        const message = getErrorMessage(e);
        console.error("Cloud sync failed:", message || e);
        setCollection(previous);
        setError(message || "Failed to sync collection.");
      }
    },
    [collection, user],
  );

  const getStatus = useCallback(
    (id: number): ItemStatus | null => {
      return collection[id] || null;
    },
    [collection],
  );

  return { collection, updateStatus, getStatus, isLoaded, error };
}
