import { api, type Page, type Paginated } from "@/shared/api";
import type {
  AudienceSegment,
  Push,
  PushImage,
  PushInput,
  PushLinkType,
  PushListParams,
  PushStats,
  PushTargetModel,
  TargetOption,
} from "../model/types";
import type { AudienceDto, PushDto, PushStatsDto, TargetDto } from "./push.dto";
import { mapAudience, mapPush, mapStats, tabToQuery, toBody } from "./push.mappers";

/** The lists a link target is picked from; a category has three levels, so three lists. */
const TARGET_LISTS: Record<Exclude<PushLinkType, "" | "page">, [string, PushTargetModel][]> = {
  category: [
    ["/categories/", "productcategory"],
    ["/sub-categories/", "productsubcategory"],
    ["/item-categories/", "productitemcategory"],
  ],
  product: [["/products/", "product"]],
  badge: [["/product-badges/", "productbadge"]],
  banner: [["/banners/", "banner"]],
};

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

  /** GET /admin/notifications/audience/ — the segments and how many customers / devices each has */
  async audience(): Promise<AudienceSegment[]> {
    return (await api.get<AudienceDto[]>("/notifications/audience/")).map(mapAudience);
  },

  /** GET /admin/notifications/{id}/ */
  async get(id: number): Promise<Push> {
    return mapPush(await api.get<PushDto>(`/notifications/${id}/`));
  },

  /** POST /admin/notifications/ — multipart when there is a picture */
  async create(input: PushInput, image: PushImage): Promise<Push> {
    const body = toBody(input, image);
    return mapPush(
      body instanceof FormData
        ? await api.upload<PushDto>("/notifications/", body)
        : await api.post<PushDto>("/notifications/", body),
    );
  },

  /** PATCH /admin/notifications/{id}/ */
  async update(id: number, input: PushInput, image: PushImage): Promise<Push> {
    return mapPush(await api.patch<PushDto>(`/notifications/${id}/`, toBody(input, image)));
  },

  /** DELETE — the read records of customers go too */
  async remove(id: number): Promise<void> {
    await api.delete(`/notifications/${id}/`);
  },

  /** Records of the picked link type, found by name (every list takes `?search=`) */
  async targets(linkType: PushLinkType, search: string): Promise<TargetOption[]> {
    if (linkType === "" || linkType === "page") return [];
    const lists = await Promise.all(
      TARGET_LISTS[linkType].map(async ([path, model]) => {
        const data = await api.get<Paginated<TargetDto>>(path, {
          search: search.trim() || undefined,
          page_size: 10,
        });
        return data.results.map((dto): TargetOption => ({
          model,
          id: dto.id,
          name: dto.name || dto.title_ru || dto.title || `#${dto.id}`,
        }));
      }),
    );
    return lists.flat();
  },
};
