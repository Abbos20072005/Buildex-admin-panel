import type { PartnerBrandsListParams } from "./partner-brands.api";

/** Query-key factory — one place that defines the cache structure of the feature. */
export const partnerBrandKeys = {
  all: ["partner-brands-admin"] as const,
  list: (params: PartnerBrandsListParams) => [...partnerBrandKeys.all, "list", params] as const,
};
