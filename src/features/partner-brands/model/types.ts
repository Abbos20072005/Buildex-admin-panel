/** Hamkor brend: a standalone name list, not linked to products or to `brands/`. */
export interface PartnerBrand {
  id: number;
  name: string;
  isActive: boolean;
}

/** What the editor sends (POST / PATCH /admin/partner-brands/). */
export interface PartnerBrandInput {
  name: string;
  isActive: boolean;
}

export interface PartnerBrandListFilters {
  search?: string;
  isActive?: boolean;
}
