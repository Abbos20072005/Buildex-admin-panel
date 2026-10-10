import { api, type Page, type Paginated } from "@/shared/api";
import type { PartnerBrand, PartnerBrandInput, PartnerBrandListFilters } from "../model/types";
import type { PartnerBrandDto } from "./partner-brands.dto";
import { filtersToQuery, inputToDto, mapPartnerBrand } from "./partner-brands.mappers";

export interface PartnerBrandsListParams {
  filters: PartnerBrandListFilters;
  page: number;
  pageSize: number;
}

export const partnerBrandsApi = {
  /** GET /admin/partner-brands/ — newest first */
  async list({ filters, page, pageSize }: PartnerBrandsListParams): Promise<Page<PartnerBrand>> {
    const data = await api.get<Paginated<PartnerBrandDto>>("/partner-brands/", {
      ...filtersToQuery(filters),
      page,
      page_size: pageSize,
      ordering: "-created_at",
    });
    return { total: data.count ?? data.results.length, items: data.results.map(mapPartnerBrand) };
  },

  /** POST /admin/partner-brands/ */
  async create(input: PartnerBrandInput): Promise<PartnerBrand> {
    return mapPartnerBrand(await api.post<PartnerBrandDto>("/partner-brands/", inputToDto(input)));
  },

  /** PATCH /admin/partner-brands/{id}/ */
  async update(id: number, input: PartnerBrandInput): Promise<PartnerBrand> {
    return mapPartnerBrand(
      await api.patch<PartnerBrandDto>(`/partner-brands/${id}/`, inputToDto(input)),
    );
  },

  /** DELETE — no restrictions, nothing is linked to a partner brand */
  async remove(id: number): Promise<void> {
    await api.delete(`/partner-brands/${id}/`);
  },
  /** PATCH /partner-brands/{id}/ { is_active } — one field, used by the bulk status change */
  async setActive(id: number, value: boolean): Promise<void> {
    await api.patch(`/partner-brands/${id}/`, { is_active: value });
  },
};
