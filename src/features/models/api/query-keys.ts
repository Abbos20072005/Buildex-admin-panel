import type { ModelsListParams } from "./models.api";

/** Query-key factory — one place that defines the cache structure of the models feature. */
export const modelKeys = {
  all: ["models-admin"] as const,
  lists: () => [...modelKeys.all, "list"] as const,
  list: (params: ModelsListParams) => [...modelKeys.lists(), params] as const,
};
