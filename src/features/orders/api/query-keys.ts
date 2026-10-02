import type { OrderFilters } from "../model/types";
import type { OrdersListParams } from "./orders.api";

/** Query-key factory — one place that defines the cache structure of the orders feature. */
export const orderKeys = {
  all: ["orders"] as const,
  lists: () => [...orderKeys.all, "list"] as const,
  list: (params: OrdersListParams) => [...orderKeys.lists(), params] as const,
  stats: (filters: OrderFilters) => [...orderKeys.all, "stats", filters] as const,
  details: () => [...orderKeys.all, "detail"] as const,
  detail: (id: number) => [...orderKeys.details(), id] as const,
};

export const referenceKeys = {
  branches: ["branches"] as const,
  managers: ["managers"] as const,
  customer: (id: number) => ["customers", id] as const,
};
