import type { CategoryLevel } from "./types";

/** URL part of the admin API for every level */
export const LEVEL_ENDPOINT: Record<CategoryLevel, string> = {
  1: "categories",
  2: "sub-categories",
  3: "item-categories",
};

/** Query parameter that limits a level to the children of one parent */
export const CHILD_FILTER: Partial<Record<CategoryLevel, string>> = {
  2: "product_category",
  3: "product_sub_category",
};

export const ROOT_PARENT = "root";

export const SLUG_PATTERN = /^[-a-zA-Z0-9_]*$/;
