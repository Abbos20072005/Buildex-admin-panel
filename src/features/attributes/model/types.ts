import type { LanguageCode } from "@/shared/i18n";

/** `value_type` of GET /admin/attributes/ */
export type AttributeValueType = "number" | "list" | "text" | "boolean";

export type Localized = Record<LanguageCode, string>;

export interface AttributeOption {
  /** undefined for options added in the editor and not saved yet */
  id?: number;
  uz: string;
  ru: string;
}

export interface AttributeCategory {
  id: number;
  name: string;
  /** "Category / Sub category / Item category" */
  path: string;
}

/** Xususiyat: a field every product of its categories can fill in. */
export interface Attribute {
  id: number;
  /** name in the admin UI language */
  name: string;
  names: Localized;
  valueType: AttributeValueType;
  /** only for numbers */
  unit: string;
  /** only for lists */
  options: AttributeOption[];
  isFilterable: boolean;
  isActive: boolean;
  categories: AttributeCategory[];
  categoriesCount: number;
  productsCount: number;
}

/** What the editor sends (POST / PATCH /admin/attributes/). */
export interface AttributeInput {
  names: Localized;
  valueType: AttributeValueType;
  unit: string;
  options: AttributeOption[];
  isFilterable: boolean;
  isActive: boolean;
}

export interface AttributeListFilters {
  search?: string;
  valueType?: AttributeValueType;
  isActive?: boolean;
  isFilterable?: boolean;
}

export type AttributeSort =
  "-created_at" | "created_at" | "name" | "-name" | "-products_count" | "-item_categories_count";
