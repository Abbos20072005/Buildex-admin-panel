import type { Query } from "@/shared/api";
import type { PartnerBrand, PartnerBrandInput, PartnerBrandListFilters } from "../model/types";
import type { PartnerBrandDto } from "./partner-brands.dto";

export const mapPartnerBrand = (dto: PartnerBrandDto): PartnerBrand => ({
  id: dto.id,
  name: dto.name,
  isActive: dto.is_active ?? true,
});

export const filtersToQuery = (filters: PartnerBrandListFilters): Query => ({
  search: filters.search?.trim() || undefined,
  is_active: filters.isActive,
});

export const inputToDto = (input: PartnerBrandInput) => ({
  name: input.name.trim(),
  is_active: input.isActive,
});
