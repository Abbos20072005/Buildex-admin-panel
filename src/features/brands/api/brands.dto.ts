/** Raw shape of GET/POST/PATCH /admin/brands/ — only the mappers touch this. */

export interface BrandDto {
  id: number;
  name: string;
  name_uz?: string | null;
  name_ru?: string | null;
  name_en?: string | null;
  description_uz?: string | null;
  description_ru?: string | null;
  description_en?: string | null;
  country?: string | null;
  image?: string | null;
  is_visible?: boolean;
  code?: string | null;
  products_count?: number;
  created_at?: string;
  updated_at?: string;
}
