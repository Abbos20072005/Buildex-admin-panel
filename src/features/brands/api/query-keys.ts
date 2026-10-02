import type { BrandsListParams } from "./brands.api";

/** Query-key factory — one place that defines the cache structure of the brands feature. */
export const brandKeys = {
  all: ["brands-admin"] as const,
  lists: () => [...brandKeys.all, "list"] as const,
  list: (params: BrandsListParams) => [...brandKeys.lists(), params] as const,
};
