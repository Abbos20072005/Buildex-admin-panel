import { api, type Page, type Paginated } from "@/shared/api";
import { LIST_SIZE } from "../model/constants";
import type {
  Banner,
  BannerFiles,
  BannerInput,
  BannerStats,
  BannerTab,
  LinkType,
  TargetModel,
  TargetOption,
} from "../model/types";
import type { BannerDto, BannerStatsDto, NamedDto } from "./banners.dto";
import { mapBanner, mapStats, tabToQuery, toFormData } from "./banners.mappers";

export interface BannersListParams {
  tab: BannerTab;
  page: number;
  pageSize?: number;
}

export const bannersApi = {
  /** GET /admin/banners/ — ordered by `position` */
  async list({ tab, page, pageSize = LIST_SIZE }: BannersListParams): Promise<Page<Banner>> {
    const data = await api.get<Paginated<BannerDto>>("/banners/", {
      ...tabToQuery(tab),
      ordering: "position",
      page,
      page_size: pageSize,
    });
    return { total: data.count ?? data.results.length, items: data.results.map(mapBanner) };
  },

  /** GET /admin/banners/stats/ — cards and tab counters */
  async stats(): Promise<BannerStats> {
    return mapStats(await api.get<BannerStatsDto>("/banners/stats/"));
  },

  /** GET /admin/banners/{id}/ */
  async get(id: number): Promise<Banner> {
    return mapBanner(await api.get<BannerDto>(`/banners/${id}/`));
  },

  /** POST /admin/banners/ (multipart — the desktop image is required) */
  async create(input: BannerInput, files: BannerFiles): Promise<Banner> {
    return mapBanner(await api.upload<BannerDto>("/banners/", toFormData(input, files)));
  },

  /** PATCH /admin/banners/{id}/ (multipart) */
  async update(banner: Banner, input: BannerInput, files: BannerFiles): Promise<Banner> {
    return mapBanner(
      await api.patch<BannerDto>(`/banners/${banner.id}/`, toFormData(input, files, banner)),
    );
  },

  /** PATCH { is_visible } — to the archive and back */
  async setVisible(id: number, isVisible: boolean): Promise<Banner> {
    return mapBanner(await api.patch<BannerDto>(`/banners/${id}/`, { is_visible: isVisible }));
  },

  /** DELETE /admin/banners/{id}/ */
  async remove(id: number): Promise<void> {
    await api.delete(`/banners/${id}/`);
  },

  /** POST /admin/banners/reorder/ — the banners of one tab in their new order */
  async reorder(ids: number[]): Promise<void> {
    await api.post("/banners/reorder/", { ids });
  },

  /**
   * Objects a banner can lead to, found by name for the "Manzil" field. Categories come from
   * all three levels at once; the others from their own lists.
   */
  async targets(linkType: LinkType, search: string): Promise<TargetOption[]> {
    const find = async (
      path: string,
      model: TargetModel,
      group: string,
      size = 20,
    ): Promise<TargetOption[]> => {
      const data = await api.get<Paginated<NamedDto>>(path, {
        search: search.trim() || undefined,
        page_size: size,
      });
      return data.results.map((item) => ({
        key: `${model}:${item.id}`,
        model,
        id: item.id,
        name: item.name,
        group,
      }));
    };

    switch (linkType) {
      case "category":
        return (
          await Promise.all([
            find("/categories/", "productcategory", "category"),
            find("/sub-categories/", "productsubcategory", "subCategory"),
            find("/item-categories/", "productitemcategory", "itemCategory"),
          ])
        ).flat();
      case "product":
        return find("/products/", "product", "product");
      case "badge":
        return find("/product-badges/", "productbadge", "badge", 100);
      case "brand":
        return find("/brands/", "brand", "brand", 30);
      default:
        return [];
    }
  },
};
