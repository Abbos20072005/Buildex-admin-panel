export interface BrandRefDto {
  id: number;
  name: string;
}

export interface AdBlockProductDto {
  id: number;
  name: string;
  product_code?: string | null;
  price?: number | null;
  discount_price?: number | null;
  is_active?: boolean;
}

/** `name`, `title`, `description` come with `_uz` / `_ru` / `_en` variants. */
export interface AdBlockDto {
  id: number;
  name: string;
  title: string;
  brand: BrandRefDto | null;
  /** detail only */
  products?: AdBlockProductDto[];
  /** list only */
  products_count?: number;
  is_visible: boolean;
  created_at: string;
  [key: string]: unknown;
}
