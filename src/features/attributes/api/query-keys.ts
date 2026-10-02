import type { AttributesListParams } from "./attributes.api";

/** Query-key factory — one place that defines the cache structure of the attributes feature. */
export const attributeKeys = {
  all: ["attributes-admin"] as const,
  lists: () => [...attributeKeys.all, "list"] as const,
  list: (params: AttributesListParams) => [...attributeKeys.lists(), params] as const,
};
