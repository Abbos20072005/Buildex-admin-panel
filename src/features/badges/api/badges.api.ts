import { api, type Page, type Paginated } from "@/shared/api";
import type { Badge, BadgeInput, BadgeListFilters } from "../model/types";
import type { BadgeDto } from "./badges.dto";
import { filtersToQuery, inputToDto, mapBadge } from "./badges.mappers";

export interface BadgesListParams {
  filters: BadgeListFilters;
  page: number;
  pageSize: number;
  /** UI language — `name` comes back translated, so it is part of the cache key */
  lang: string;
}

export const badgesApi = {
  /** GET /admin/product-badges/ — ordered by `position` */
  async list({ filters, page, pageSize }: BadgesListParams): Promise<Page<Badge>> {
    const data = await api.get<Paginated<BadgeDto>>("/product-badges/", {
      ...filtersToQuery(filters),
      page,
      page_size: pageSize,
      ordering: "position",
    });
    return { total: data.count ?? data.results.length, items: data.results.map(mapBadge) };
  },

  /** POST /admin/product-badges/ — the rule is applied at once */
  async create(input: BadgeInput): Promise<Badge> {
    return mapBadge(await api.post<BadgeDto>("/product-badges/", inputToDto(input)));
  },

  /** PATCH /admin/product-badges/{id}/ */
  async update(id: number, input: BadgeInput): Promise<Badge> {
    return mapBadge(await api.patch<BadgeDto>(`/product-badges/${id}/`, inputToDto(input)));
  },

  /** DELETE /admin/product-badges/{id}/ */
  async remove(id: number): Promise<void> {
    await api.delete(`/product-badges/${id}/`);
  },

  /** POST /admin/product-badges/reorder/ — all badge ids in the new order */
  async reorder(ids: number[]): Promise<void> {
    await api.post("/product-badges/reorder/", { ids });
  },
  /** PATCH /product-badges/{id}/ { is_active } — one field, used by the bulk status change */
  async setActive(id: number, value: boolean): Promise<void> {
    await api.patch(`/product-badges/${id}/`, { is_active: value });
  },
};
