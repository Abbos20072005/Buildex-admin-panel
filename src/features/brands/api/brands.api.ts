import { api, type Page, type Paginated } from "@/shared/api";
import type { Brand, BrandInput, BrandListFilters, BrandSort } from "../model/types";
import type { BrandDto } from "./brands.dto";
import { filtersToQuery, inputToFields, mapBrand, toFormData } from "./brands.mappers";

export interface BrandsListParams {
  filters: BrandListFilters;
  page: number;
  pageSize: number;
  sort?: BrandSort;
  /** UI language — `name` comes back translated, so it is part of the cache key */
  lang: string;
}

export const brandsApi = {
  /** GET /admin/brands/ — server-side search and pagination */
  async list({
    filters,
    page,
    pageSize,
    sort = "-products_count",
  }: BrandsListParams): Promise<Page<Brand>> {
    const data = await api.get<Paginated<BrandDto>>("/brands/", {
      ...filtersToQuery(filters),
      page,
      page_size: pageSize,
      ordering: sort,
    });
    return { total: data.count ?? data.results.length, items: data.results.map(mapBrand) };
  },

  /** POST /admin/brands/ (multipart — the logo is required) */
  async create(input: BrandInput, image: File): Promise<Brand> {
    return mapBrand(
      await api.upload<BrandDto>("/brands/", toFormData(inputToFields(input), image)),
    );
  },

  /** PATCH /admin/brands/{id}/ — JSON, or multipart when a new logo is picked */
  async update(brand: Brand, input: BrandInput, image?: File): Promise<Brand> {
    const fields = inputToFields(input, brand);
    const body = image ? toFormData(fields, image) : fields;
    return mapBrand(await api.patch<BrandDto>(`/brands/${brand.id}/`, body));
  },

  /** PATCH /admin/brands/{id}/ { is_visible } — the "home page" switch in the table */
  async setVisible(id: number, isVisible: boolean): Promise<Brand> {
    return mapBrand(await api.patch<BrandDto>(`/brands/${id}/`, { is_visible: isVisible }));
  },

  /** DELETE — refused while the brand has products (hide it instead) */
  async remove(id: number): Promise<void> {
    await api.delete(`/brands/${id}/`);
  },
};
