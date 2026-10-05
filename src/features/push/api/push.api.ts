import { api, type Page, type Paginated } from "@/shared/api";
import type { Push, PushInput, PushListParams, PushStats } from "../model/types";
import type { PushDto, PushStatsDto } from "./push.dto";
import { inputToDto, mapPush, mapStats, tabToQuery } from "./push.mappers";

export const pushApi = {
  /** GET /admin/notifications/ — newest `publish_at` first (the backend default) */
  async list({ tab, page, pageSize }: PushListParams): Promise<Page<Push>> {
    const data = await api.get<Paginated<PushDto>>("/notifications/", {
      ...tabToQuery(tab),
      page,
      page_size: pageSize,
    });
    return { total: data.count ?? data.results.length, items: data.results.map(mapPush) };
  },

  /** GET /admin/notifications/stats/ — cards and tab counters */
  async stats(): Promise<PushStats> {
    return mapStats(await api.get<PushStatsDto>("/notifications/stats/"));
  },

  /** GET /admin/notifications/{id}/ */
  async get(id: number): Promise<Push> {
    return mapPush(await api.get<PushDto>(`/notifications/${id}/`));
  },

  /** POST /admin/notifications/ */
  async create(input: PushInput): Promise<Push> {
    return mapPush(await api.post<PushDto>("/notifications/", inputToDto(input)));
  },

  /** PATCH /admin/notifications/{id}/ */
  async update(id: number, input: PushInput): Promise<Push> {
    return mapPush(await api.patch<PushDto>(`/notifications/${id}/`, inputToDto(input)));
  },

  /** DELETE — the read records of customers go too */
  async remove(id: number): Promise<void> {
    await api.delete(`/notifications/${id}/`);
  },
};
