import type { ProductFilters } from "../model/types";
import type { ProductsListParams } from "./products.api";

/** Query-key factory — one place that defines the cache structure of the products feature. */
export const productKeys = {
  all: ["products"] as const,
  lists: () => [...productKeys.all, "list"] as const,
  list: (params: ProductsListParams) => [...productKeys.lists(), params] as const,
  stats: () => [...productKeys.all, "stats"] as const,
  tabCounts: (filters: ProductFilters) => [...productKeys.stats(), "tabs", filters] as const,
  total: () => [...productKeys.stats(), "total"] as const,
  inReview: () => [...productKeys.stats(), "review"] as const,
  details: () => [...productKeys.all, "detail"] as const,
  detail: (id: number, lang: string) => [...productKeys.details(), id, lang] as const,
};

/** Dictionaries are translated too, so the language is part of every key. */
export const productReferenceKeys = {
  categories: (lang: string) => ["categories", lang] as const,
  brands: (lang: string, search: string) => ["brands", lang, search] as const,
  badges: (lang: string) => ["product-badges", lang] as const,
  attributes: (lang: string, itemCategoryId: number) =>
    ["attributes", lang, itemCategoryId] as const,
  itemCategories: (lang: string, search: string) => ["item-categories", lang, search] as const,
};
