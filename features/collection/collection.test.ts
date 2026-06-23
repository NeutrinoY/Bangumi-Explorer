import { describe, expect, it } from "vitest";
import {
  applyCollectionStatus,
  type CollectionRow,
  type CollectionStore,
  isAdminUser,
  parseCollectionRows,
} from "./state";

describe("collection state", () => {
  it("treats only the configured admin uid as admin", () => {
    expect(isAdminUser({ id: "admin-1" }, "admin-1")).toBe(true);
    expect(isAdminUser({ id: "other-user" }, "admin-1")).toBe(false);
    expect(isAdminUser(null, "admin-1")).toBe(false);
    expect(isAdminUser({ id: "admin-1" }, undefined)).toBe(false);
  });

  it("applies collection status without mutating the previous store", () => {
    const previous: CollectionStore = {
      1: "collected",
      2: "ignored",
    };

    const updated = applyCollectionStatus(previous, 2, "wishlist");
    const deleted = applyCollectionStatus(previous, 1, null);

    expect(updated).toEqual({ 1: "collected", 2: "wishlist" });
    expect(deleted).toEqual({ 2: "ignored" });
    expect(previous).toEqual({ 1: "collected", 2: "ignored" });
  });

  it("parses known collection rows and ignores malformed statuses", () => {
    const rows: CollectionRow[] = [
      { subject_id: 1, status: "collected" },
      { subject_id: 2, status: "ignored" },
      { subject_id: 3, status: "unknown" },
    ];

    expect(parseCollectionRows(rows)).toEqual({
      1: "collected",
      2: "ignored",
    });
  });
});
