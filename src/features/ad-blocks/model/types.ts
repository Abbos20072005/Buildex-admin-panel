import type { Localized } from "@/shared/lib/localized";

export interface BrandRef {
  id: number;
  name: string;
}

/** A product inside a block (read-only data for the list in the editor). */
export interface AdBlockProduct {
  id: number;
  name: string;
  productCode: string;
  price: number | null;
  discountPrice: number | null;
  /** an inactive product stays in the block but is not shown to customers */
  isActive: boolean;
}

/** Reklama bloki: a product section of the home page with its own campaign page. */
export interface AdBlock {
  id: number;
  /** block name in the admin UI language */
  name: string;
  title: string;
  nameL: Localized;
  titleL: Localized;
  /** HTML; not in the list */
  description: Localized;
  brand: BrandRef | null;
  /** only in the detail; the list has `productsCount` */
  products: AdBlockProduct[];
  productsCount: number;
  isVisible: boolean;
  createdAt: string;
}

/** What the editor sends (POST / PATCH /admin/adds-brands/). */
export interface AdBlockInput {
  name: Localized;
  title: Localized;
  description: Localized;
  brandId: number | null;
  productIds: number[];
  isVisible: boolean;
}

export interface AdBlockFilters {
  search?: string;
  isVisible?: boolean;
  hasBrand?: boolean;
}

export interface AdBlockListParams {
  filters: AdBlockFilters;
  page: number;
  pageSize: number;
}
