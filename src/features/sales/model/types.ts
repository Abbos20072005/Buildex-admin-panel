/** A product inside a sale (same data as inside a carousel). */
export interface SaleProduct {
  id: number;
  name: string;
  productCode: string;
  price: number | null;
  discountPrice: number | null;
  /** an inactive product stays in the sale but is not shown to customers */
  isActive: boolean;
}

/** Aksiya (Распродажа): a discount campaign with its products and a period. */
export interface Sale {
  id: number;
  name: string;
  image: string | null;
  bgImage: string | null;
  /** YYYY-MM-DD */
  discountFrom: string;
  discountTo: string;
  /** only one sale can be the main one */
  isMain: boolean;
  isVisible: boolean;
  /** the list has `productsCount`; `products` only comes with the detail */
  productsCount: number;
  products: SaleProduct[];
  createdAt: string;
}

/** What the editor sends (POST / PATCH /admin/sales/); images go separately. */
export interface SaleInput {
  name: string;
  discountFrom: string;
  discountTo: string;
  isMain: boolean;
  isVisible: boolean;
  productIds: number[];
}

export interface SaleFiles {
  image?: File;
  bgImage?: File;
}

export interface SaleFilters {
  search?: string;
  isVisible?: boolean;
  isMain?: boolean;
}

export interface SaleListParams {
  filters: SaleFilters;
  page: number;
  pageSize: number;
}
