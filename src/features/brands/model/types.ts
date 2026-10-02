import type { LanguageCode } from "@/shared/i18n";

export type Localized = Record<LanguageCode, string>;

/** Brend (GET /admin/brands/). */
export interface Brand {
  id: number;
  /** name in the admin UI language */
  name: string;
  names: Localized;
  descriptions: Localized;
  /** plain text, not translated */
  country: string;
  image: string | null;
  /** shown on the home page */
  isVisible: boolean;
  /** 1C code */
  code: string | null;
  productsCount: number;
}

/** What the editor sends (POST / PATCH /admin/brands/). */
export interface BrandInput {
  name: string;
  descriptions: Localized;
  country: string;
  isVisible: boolean;
  code: string;
}

export interface BrandListFilters {
  search?: string;
  isVisible?: boolean;
}

export type BrandSort =
  "-products_count" | "products_count" | "name" | "-name" | "country" | "-created_at";
