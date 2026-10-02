import type { CategoryLevel } from "../model/types";

/** Query-key factory — one place that defines the cache structure of the categories feature. */
export const categoryKeys = {
  all: ["categories-admin"] as const,
  /** children of one parent (parentId = null — the top level) */
  list: (level: CategoryLevel, parentId: number | null) =>
    [...categoryKeys.all, "list", level, parentId] as const,
  search: (term: string) => [...categoryKeys.all, "search", term] as const,
  counts: () => [...categoryKeys.all, "counts"] as const,
  /** every category of the first two levels — parent choices of the form */
  parents: () => [...categoryKeys.all, "parents"] as const,
  attributes: (id: number) => [...categoryKeys.all, "attributes", id] as const,
};
