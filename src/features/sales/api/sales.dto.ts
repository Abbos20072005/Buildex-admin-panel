/** Raw shape of /admin/sales/ — only the mappers touch this. */

export interface SaleProductDto {
  id: number;
  name: string;
  product_code?: string | null;
  price?: number | null;
  discount_price?: number | null;
  is_active?: boolean;
}

export interface SaleDto {
  id: number;
  name: string;
  image?: string | null;
  bg_image?: string | null;
  discount_from: string;
  discount_to: string;
  is_main: boolean;
  is_visible: boolean;
  products_count?: number;
  products?: SaleProductDto[];
  created_at: string;
}
