/** Raw shapes of the Dommaster Admin API (products). Only the mappers touch these. */

import type { AttributeValueType, PublishStatus, Unit } from "../model/types";

export interface NamedRefDto {
  id: number;
  name: string;
}

export interface ProductImageDto {
  id: number;
  image: string;
  created_at: string;
}

export interface ItemCategoryRefDto extends NamedRefDto {
  product_sub_category?: {
    id: number;
    name: string;
    product_category?: NamedRefDto | null;
  } | null;
}

export interface ProductListDto {
  id: number;
  name: string;
  images: ProductImageDto[];
  product_code?: string | null;
  articul_code?: string | null;
  barcode?: string | null;
  brand: NamedRefDto | null;
  badge: NamedRefDto | null;
  product_item_category: ItemCategoryRefDto | null;
  price?: number | null;
  discount_price?: number | null;
  discount?: number | null;
  unit?: Unit;
  quantity?: number | null;
  rating?: number | null;
  comments_quantity?: number | null;
  is_active?: boolean;
  erp_active?: boolean;
  publish_status?: PublishStatus;
  purchasable?: boolean;
  created_at: string;
  updated_at: string;
}

export interface AttributeOptionDto {
  id: number;
  value_uz: string;
  value_ru: string;
}

/** Attribute inside `attribute_values` / GET /admin/item-categories/{id}/attributes/ */
export interface ProductAttributeDto {
  id: number;
  name: string;
  value_type: AttributeValueType;
  unit?: string | null;
  options?: AttributeOptionDto[];
  is_filterable?: boolean;
}

export interface AttributeValueDto {
  id?: number;
  attribute: ProductAttributeDto;
  value_uz: string;
  value_ru: string;
}

/** Item of `attribute_values` in PATCH /admin/products/{id}/ */
export interface AttributeValueWriteDto {
  attribute: number;
  value_uz: string;
  value_ru: string;
}

export interface ProductDto extends ProductListDto {
  name_uz?: string | null;
  name_ru?: string | null;
  name_en?: string | null;
  short_description?: string | null;
  description_uz?: string | null;
  description_ru?: string | null;
  description_en?: string | null;
  weight?: string | null;
  length?: string | null;
  width?: string | null;
  height?: string | null;
  questions_quantity?: number | null;
  attribute_values?: AttributeValueDto[];
}

export interface ProductStatsDto {
  total?: number;
  active?: number;
  inactive?: number;
  out_of_stock?: number;
  discounted?: number;
}

/** Brand / badge / category references (filters and the catalog card). */
export interface ReferenceDto {
  id: number;
  name: string;
}

export interface ItemCategoryDto extends ReferenceDto {
  product_sub_category?: { id: number; name?: string; product_category?: ReferenceDto } | null;
}
