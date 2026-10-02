import type { ProductFilters, PublishStatus, Unit } from "./types";

export const PUBLISH_STATUSES: PublishStatus[] = ["published", "draft", "review"];
export const UNITS: Unit[] = ["pcs", "kg", "g", "l", "m", "sm", "pkg", "set"];

/** antd <Tag color> per publish status */
export const PUBLISH_STATUS_COLOR: Record<PublishStatus, string> = {
  published: "green",
  draft: "default",
  review: "gold",
};

export type ProductTab = "all" | "published" | "draft" | "review" | "soldOut" | "inactive";

export const PRODUCT_TABS: ProductTab[] = [
  "all",
  "published",
  "draft",
  "review",
  "soldOut",
  "inactive",
];

/** Extra list filters each tab adds on top of the filter panel. */
export const TAB_FILTERS: Record<ProductTab, ProductFilters> = {
  all: {},
  published: { publishStatus: "published" },
  draft: { publishStatus: "draft" },
  review: { publishStatus: "review" },
  // published, but nothing left in stock
  soldOut: { publishStatus: "published", inStock: false },
  inactive: { isActive: false },
};

/** Tabs whose counter is shown in red (needs attention). */
export const ALERT_TABS: ProductTab[] = ["soldOut"];

export type ProductView = "table" | "cards";

export const PAGE_SIZES = [20, 50, 100];
export const DEFAULT_PAGE_SIZE = 20;
