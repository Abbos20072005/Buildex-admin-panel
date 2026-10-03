/** Raw shape of GET/POST/PATCH /admin/partner-brands/ — only the mappers touch this. */

export interface PartnerBrandDto {
  id: number;
  name: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}
