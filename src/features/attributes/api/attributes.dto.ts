/** Raw shapes of GET/POST/PATCH /admin/attributes/ — only the mappers touch these. */

import type { AttributeValueType } from "../model/types";

export interface AttributeOptionDto {
  id?: number;
  value_uz: string;
  value_ru: string;
  value_en?: string | null;
}

export interface AttributeCategoryDto {
  id: number;
  name: string;
  product_sub_category?: {
    id: number;
    name: string;
    product_category?: { id: number; name: string } | null;
  } | null;
}

export interface AttributeDto {
  id: number;
  name: string;
  name_uz?: string | null;
  name_ru?: string | null;
  name_en?: string | null;
  value_type: AttributeValueType;
  unit?: string | null;
  options?: AttributeOptionDto[];
  is_filterable?: boolean;
  is_active?: boolean;
  item_categories?: AttributeCategoryDto[];
  item_categories_count?: number;
  products_count?: number;
  created_at: string;
  updated_at: string;
}

export interface AttributeWriteDto {
  name_uz: string;
  name_ru: string;
  value_type: AttributeValueType;
  unit?: string;
  options?: AttributeOptionDto[];
  is_filterable: boolean;
  is_active: boolean;
}
