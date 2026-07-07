/**
 * Collection domain: the owner's per-subject status, mirrored from Supabase.
 * Pure data rules only — network and auth live in the hooks layer.
 */

export const ITEM_STATUSES = ["collected", "wishlist", "ignored"] as const;
export type ItemStatus = (typeof ITEM_STATUSES)[number];

/** subject id → status. Absence means "todo" (not yet triaged). */
export type CollectionMap = ReadonlyMap<number, ItemStatus>;

export const EMPTY_COLLECTION: CollectionMap = new Map();

export function isItemStatus(value: unknown): value is ItemStatus {
  return typeof value === "string" && (ITEM_STATUSES as readonly string[]).includes(value);
}

/** Rows as they come back from the user_collections table. */
export interface CollectionRow {
  subject_id: number;
  status: string;
}

/** Malformed rows are dropped rather than crashing the whole collection. */
export function parseCollectionRows(rows: readonly CollectionRow[] | null): CollectionMap {
  const map = new Map<number, ItemStatus>();
  for (const row of rows ?? []) {
    if (isItemStatus(row.status) && Number.isInteger(row.subject_id)) {
      map.set(row.subject_id, row.status);
    }
  }
  return map;
}

/** Returns a new map with the status applied; null clears the entry (back to todo). */
export function withStatus(
  collection: CollectionMap,
  id: number,
  status: ItemStatus | null,
): CollectionMap {
  const next = new Map(collection);
  if (status === null) {
    next.delete(id);
  } else {
    next.set(id, status);
  }
  return next;
}

export interface UserIdentity {
  id: string;
}

/** Admin = the exact configured account. RLS remains the real write barrier. */
export function isAdminUser(
  user: UserIdentity | null,
  adminUid: string | undefined,
): user is UserIdentity {
  return Boolean(user && adminUid && user.id === adminUid);
}
