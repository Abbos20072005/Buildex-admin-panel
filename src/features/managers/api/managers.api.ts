import { api, type Page, type Paginated } from "@/shared/api";
import type { Manager, ManagerInput, ManagerListParams } from "../model/types";
import type { ManagerDto } from "./managers.dto";
import { filtersToQuery, inputToDto, mapManager } from "./managers.mappers";

export const managersApi = {
  /** GET /admin/managers/ — newest first */
  async list({ filters, page, pageSize }: ManagerListParams): Promise<Page<Manager>> {
    const data = await api.get<Paginated<ManagerDto>>("/managers/", {
      ...filtersToQuery(filters),
      page,
      page_size: pageSize,
      ordering: "-created_at",
    });
    return { total: data.count ?? data.results.length, items: data.results.map(mapManager) };
  },

  /** POST /admin/managers/ */
  async create(input: ManagerInput): Promise<Manager> {
    return mapManager(await api.post<ManagerDto>("/managers/", inputToDto(input)));
  },

  /** PATCH /admin/managers/{id}/ */
  async update(id: number, input: ManagerInput): Promise<Manager> {
    return mapManager(await api.patch<ManagerDto>(`/managers/${id}/`, inputToDto(input)));
  },

  /** DELETE /admin/managers/{id}/ */
  async remove(id: number): Promise<void> {
    await api.delete(`/managers/${id}/`);
  },
};
