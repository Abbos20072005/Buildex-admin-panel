/** Raw shapes of the Dommaster Admin API (categories) — only the mappers touch these. */

/** ProductCategory / ProductSubCategoryAdmin / ProductItemCategoryAdmin */
export interface CategoryDto {
  id: number;
  name: string;
  name_uz?: string | null;
  name_ru?: string | null;
  slug?: string | null;
  code?: string | null;
  icon?: string | null;
  image?: string | null;
  position?: number;
  meta_title_uz?: string | null;
  meta_title_ru?: string | null;
  meta_description_uz?: string | null;
  meta_description_ru?: string | null;
  show_on_site?: boolean;
  show_in_app?: boolean;
  is_active?: boolean;
  children_count?: number;
  products_count?: number;
  filters_count?: number;
  /** sub categories */
  product_category?: { id: number; name: string } | null;
  /** item categories */
  product_sub_category?: {
    id: number;
    name: string;
    product_category?: { id: number; name: string } | null;
  } | null;
}

export interface CategoryAttributeDto {
  id: number;
  name: string;
  value_type: "number" | "list" | "text" | "boolean";
  unit?: string | null;
  is_filterable?: boolean;
}
