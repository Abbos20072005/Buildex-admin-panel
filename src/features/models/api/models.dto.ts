/** Raw shape of GET/POST/PATCH /admin/product-models/ — only the mappers touch this. */

export interface ProductModelDto {
  id: number;
  name: string;
  brand?: { id: number; name: string } | null;
  is_active?: boolean;
  products_count?: number;
  created_at?: string;
  updated_at?: string;
}

export interface ProductModelWriteDto {
  name: string;
  brand: { id: number };
  is_active: boolean;
}
