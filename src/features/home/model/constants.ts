import type { BlockType } from "./types";

/** The block types in the order of the "+ Blok qo'shish" menu. */
export const BLOCK_TYPES: BlockType[] = [
  "slider",
  "banner",
  "categories",
  "brands",
  "badge_products",
  "sale_products",
  "new_products",
  "bestsellers",
  "all_products",
  "pages",
  "content",
  "adds_brands",
];

/** Values of a slider block's `banner_placement`. */
export const SLIDER_PLACEMENTS = ["site_home", "app_home", "home_bottom", "catalog"] as const;

/** Product blocks: their count says "N ta mos (M dan)" and the display rules apply. */
export const PRODUCT_BLOCKS: BlockType[] = [
  "badge_products",
  "sale_products",
  "new_products",
  "bestsellers",
  "all_products",
];
