export type ItemStatus = "collected" | "wishlist" | "ignored";

export type CollectionStore = Record<number, ItemStatus>;

export interface CollectionRow {
  subject_id: number;
  status: string;
}

export interface UserIdentity {
  id: string;
}

export function isItemStatus(value: string): value is ItemStatus {
  return value === "collected" || value === "wishlist" || value === "ignored";
}

export function isAdminUser(
  user: UserIdentity | null,
  adminUid: string | undefined,
): user is UserIdentity {
  return Boolean(user && adminUid && user.id === adminUid);
}

export function applyCollectionStatus(
  collection: CollectionStore,
  id: number,
  status: ItemStatus | null,
): CollectionStore {
  const next = { ...collection };
  if (status === null) {
    delete next[id];
  } else {
    next[id] = status;
  }
  return next;
}

export function parseCollectionRows(rows: CollectionRow[] | null): CollectionStore {
  const collection: CollectionStore = {};
  for (const row of rows ?? []) {
    if (isItemStatus(row.status)) {
      collection[row.subject_id] = row.status;
    }
  }
  return collection;
}
