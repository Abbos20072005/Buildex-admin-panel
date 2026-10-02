import type { BadgesListParams } from "./badges.api";

/** Query-key factory — one place that defines the cache structure of the badges feature. */
export const badgeKeys = {
  all: ["badges-admin"] as const,
  lists: () => [...badgeKeys.all, "list"] as const,
  list: (params: BadgesListParams) => [...badgeKeys.lists(), params] as const,
};
