import { api, type Page, type Paginated } from "@/shared/api";
import type {
  Attribute,
  AttributeInput,
  AttributeListFilters,
  AttributeSort,
} from "../model/types";
import type { AttributeDto } from "./attributes.dto";
import { filtersToQuery, inputToDto, mapAttribute } from "./attributes.mappers";

export interface AttributesListParams {
  filters: AttributeListFilters;
  page: number;
  pageSize: number;
  sort?: AttributeSort;
  /** UI language — `name` comes back translated, so it is part of the cache key */
  lang: string;
}

export const attributesApi = {
  /** GET /admin/attributes/ — server-side search and pagination */
  async list({
    filters,
    page,
    pageSize,
    sort = "-created_at",
  }: AttributesListParams): Promise<Page<Attribute>> {
    const data = await api.get<Paginated<AttributeDto>>("/attributes/", {
      ...filtersToQuery(filters),
      page,
      page_size: pageSize,
      ordering: sort,
    });
    return { total: data.count ?? data.results.length, items: data.results.map(mapAttribute) };
  },

  /** POST /admin/attributes/ */
  async create(input: AttributeInput): Promise<Attribute> {
    return mapAttribute(await api.post<AttributeDto>("/attributes/", inputToDto(input)));
  },

  /** PATCH /admin/attributes/{id}/ */
  async update(id: number, input: AttributeInput): Promise<Attribute> {
    return mapAttribute(await api.patch<AttributeDto>(`/attributes/${id}/`, inputToDto(input)));
  },

  /** DELETE /admin/attributes/{id}/ — refused while the attribute is used */
  async remove(id: number): Promise<void> {
    await api.delete(`/attributes/${id}/`);
  },
  /** PATCH /attributes/{id}/ { is_active } — one field, used by the bulk status change */
  async setActive(id: number, value: boolean): Promise<void> {
    await api.patch(`/attributes/${id}/`, { is_active: value });
  },
};
