/** Model — a model line of a brand (Chint → NXB-63). A product picks a model of its own brand. */
export interface ProductModel {
  id: number;
  name: string;
  brand: { id: number; name: string } | null;
  isActive: boolean;
  productsCount: number;
}

/** What the editor sends (POST / PATCH /admin/product-models/). */
export interface ProductModelInput {
  name: string;
  brandId: number | null;
  isActive: boolean;
}

export interface ProductModelListFilters {
  search?: string;
  brandId?: number;
  isActive?: boolean;
}

export type ProductModelSort =
  "name" | "-name" | "-products_count" | "products_count" | "-created_at";
