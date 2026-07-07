"use client";

import type { User } from "@supabase/supabase-js";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  type CollectionMap,
  type CollectionRow,
  EMPTY_COLLECTION,
  type ItemStatus,
  isAdminUser,
  parseCollectionRows,
  withStatus,
} from "@/features/collection/domain";
import { ADMIN_UID, supabase } from "@/shared/data/supabase";

export interface CollectionApi {
  /** null = not triaged (todo). */
  getStatus: (id: number) => ItemStatus | null;
  /** No-op with a toast when the caller isn't the admin. */
  updateStatus: (id: number, status: ItemStatus | null) => void;
  /** False until the initial load settles (successfully or not). */
  isLoaded: boolean;
}

function describeError(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (error && typeof error === "object" && "message" in error) return String(error.message);
  return String(error);
}

/**
 * The public site always shows the owner's collection; writing requires the
 * admin session. Updates are optimistic with rollback + toast on failure.
 */
export function useCollection(user: User | null): CollectionApi {
  const [collection, setCollection] = useState<CollectionMap>(EMPTY_COLLECTION);
  const [isLoaded, setIsLoaded] = useState(false);
  // Live view of the map for rollback closures, without re-creating
  // updateStatus (and re-rendering every card) on each collection change.
  const collectionRef = useRef(collection);
  collectionRef.current = collection;

  useEffect(() => {
    if (!ADMIN_UID) {
      // Collection features are disabled without an owner; browsing still works.
      setIsLoaded(true);
      return;
    }

    let cancelled = false;

    const load = async () => {
      const { data, error } = await supabase
        .from("user_collections")
        .select("subject_id, status")
        .eq("user_id", ADMIN_UID);

      if (cancelled) return;
      if (error) {
        toast.error("Failed to load collection", { description: describeError(error) });
      } else {
        setCollection(parseCollectionRows(data as CollectionRow[]));
      }
      setIsLoaded(true);
    };

    load();

    // Keep other open devices in sync (e.g. triaging on the phone, watching
    // on the desktop). Events carry the changed row, so apply it directly
    // instead of re-fetching the whole table.
    const channel = supabase
      .channel("user_collections-sync")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "user_collections",
          filter: `user_id=eq.${ADMIN_UID}`,
        },
        (payload) => {
          if (payload.eventType === "DELETE") {
            const old = payload.old as Partial<CollectionRow>;
            if (typeof old.subject_id === "number") {
              setCollection((prev) => withStatus(prev, old.subject_id as number, null));
            }
            return;
          }
          const parsed = parseCollectionRows([payload.new as CollectionRow]);
          setCollection((prev) => {
            let next = prev;
            for (const [id, status] of parsed) next = withStatus(next, id, status);
            return next;
          });
        },
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, []);

  const updateStatus = useCallback(
    (id: number, status: ItemStatus | null) => {
      if (!isAdminUser(user, ADMIN_UID)) {
        toast.error("Admin login required to edit the collection.");
        return;
      }

      const previous = collectionRef.current;
      setCollection(withStatus(previous, id, status));

      const sync = async () => {
        // RLS is the real security boundary; this write just mirrors local state.
        const { error } =
          status === null
            ? await supabase
                .from("user_collections")
                .delete()
                .eq("user_id", user.id)
                .eq("subject_id", id)
            : await supabase
                .from("user_collections")
                .upsert(
                  { user_id: user.id, subject_id: id, status },
                  { onConflict: "user_id, subject_id" },
                );

        if (error) {
          setCollection(previous);
          toast.error("Sync failed, change reverted", { description: describeError(error) });
        }
      };

      void sync();
    },
    [user],
  );

  const getStatus = useCallback((id: number) => collection.get(id) ?? null, [collection]);

  return { getStatus, updateStatus, isLoaded };
}
