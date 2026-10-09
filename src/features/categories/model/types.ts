import type { LanguageCode } from "@/shared/i18n";

/** 1 — category, 2 — sub category, 3 — item category (the only level products are attached to) */
export type CategoryLevel = 1 | 2 | 3;

export type Localized = Record<LanguageCode, string>;

/** A category of any level (an item of GET /admin/{categories|sub-categories|item-categories}/). */
export interface CategoryItem {
  id: number;
  level: CategoryLevel;
  /** name in the admin UI language — the fallback when a language is not filled in */
  name: string;
  names: Localized;
  slug: string;
  code: string | null;
  position: number;
  metaTitle: Localized;
  metaDescription: Localized;
  showOnSite: boolean;
  showInApp: boolean;
  isActive: boolean;
  image: string | null;
  icon: string | null;
  productsCount: number;
  filtersCount: number;
  /** categories one level down; 0 for item categories */
  childrenCount: number;
  /** id of the parent on the level above; null for the top level */
  parentId: number | null;
  /** "Category / Sub category" the item lives in; empty for the top level */
  parentPath: string;
}

/** Parent choice in the form: level 1 → new sub category, level 2 → new item category. */
export interface CategoryParentOption {
  /** "1:6" — level and id, ids repeat between levels */
  key: string;
  level: 1 | 2;
  id: number;
  label: string;
}

/** An attribute attached to an item category. */
export interface CategoryAttributeRef {
  id: number;
  name: string;
  valueType: "number" | "list" | "text" | "boolean";
  unit: string;
  isFilterable: boolean;
  /** setting of this category, not of the attribute */
  isQuickFilter: boolean;
  /** 0 — every value */
  maxQuickFilters: number;
}

/** Editable state of the category form. */
export interface CategoryFormValues {
  names: Localized;
  slug: string;
  code: string;
  metaTitle: Localized;
  metaDescription: Localized;
  showOnSite: boolean;
  showInApp: boolean;
  isActive: boolean;
  /** `CategoryParentOption.key`, or "root" for the top level */
  parent: string;
  /** item categories only, in the order they are shown on the product page */
  attributes: CategoryAttributeRef[];
}

/** Files picked in the form; undefined — keep the current ones. */
export interface CategoryFiles {
  image?: File;
  icon?: File;
}

/** A row of the table: a category and where it stands in the opened tree. */
export interface CategoryRow {
  item: CategoryItem;
  depth: number;
  /** the children are being loaded */
  loadingChildren: boolean;
  /** drag & drop is allowed (all brothers and sisters are loaded) */
  canReorder: boolean;
  /** brothers and sisters in their current order */
  siblingIds: number[];
}
