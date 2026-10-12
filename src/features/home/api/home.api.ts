import { api, type Paginated } from "@/shared/api";
import type {
  Channel,
  HomeBlock,
  HomeBlockInput,
  HomePageState,
  HomeRulesInput,
  SourceOption,
} from "../model/types";
import type { Device, PreviewItem, PreviewSource } from "../model/preview";
import type {
  HomeBlockDto,
  HomePageDto,
  PreviewBannerDto,
  PreviewCategoryDto,
  PreviewProductDto,
  SourceRefDto,
} from "./home.dto";
import { blockToDto, mapBlock, mapPageState, rulesToDto } from "./home.mappers";

const toOption = (dto: SourceRefDto): SourceOption => ({
  id: dto.id,
  name: dto.name || dto.title || dto.code || `#${dto.id}`,
});

export const homeApi = {
  /** GET /admin/home-blocks/?channel= — an array in the page order (the draft) */
  async blocks(channel: Channel): Promise<HomeBlock[]> {
    const data = await api.get<HomeBlockDto[] | Paginated<HomeBlockDto>>("/home-blocks/", {
      channel,
    });
    return (Array.isArray(data) ? data : data.results).map(mapBlock);
  },

  /** POST /admin/home-blocks/ */
  async createBlock(input: HomeBlockInput): Promise<HomeBlock> {
    return mapBlock(await api.post<HomeBlockDto>("/home-blocks/", blockToDto(input, true)));
  },

  /** PATCH /admin/home-blocks/{id}/ — the type can't change */
  async updateBlock(id: number, input: HomeBlockInput): Promise<HomeBlock> {
    return mapBlock(await api.patch<HomeBlockDto>(`/home-blocks/${id}/`, blockToDto(input, false)));
  },

  /** PATCH { is_visible } — hide / show by hand */
  async setVisible(id: number, isVisible: boolean): Promise<HomeBlock> {
    return mapBlock(
      await api.patch<HomeBlockDto>(`/home-blocks/${id}/`, { is_visible: isVisible }),
    );
  },

  /** DELETE /admin/home-blocks/{id}/ */
  async removeBlock(id: number): Promise<void> {
    await api.delete(`/home-blocks/${id}/`);
  },

  /** POST /admin/home-blocks/reorder/ — the blocks of one tab in the new order */
  async reorder(ids: number[]): Promise<void> {
    await api.post("/home-blocks/reorder/", { ids });
  },

  /** GET /admin/home-page/ — rules and the publish state */
  async page(): Promise<HomePageState> {
    return mapPageState(await api.get<HomePageDto>("/home-page/"));
  },

  /** PATCH /admin/home-page/ — one or more rules */
  async saveRules(input: HomeRulesInput): Promise<HomePageState> {
    return mapPageState(await api.patch<HomePageDto>("/home-page/", rulesToDto(input)));
  },

  /** POST /admin/home-page/publish/ — the draft becomes the published version */
  async publish(): Promise<HomePageState> {
    return mapPageState(await api.post<HomePageDto>("/home-page/publish/"));
  },

  /**
   * What a block would show, composed from the ordinary admin lists (the API has no draft
   * preview): banners, categories, brands, products, sales, carousels. A few items are enough.
   */
  async preview(source: PreviewSource, device: Device): Promise<PreviewItem[]> {
    const product = (dto: PreviewProductDto): PreviewItem => ({
      id: dto.id,
      title: dto.name,
      image: dto.images?.[0]?.image ?? null,
      price: dto.discount_price || dto.price || null,
      oldPrice: dto.discount_price ? (dto.price ?? null) : null,
    });
    const banner = (dto: PreviewBannerDto): PreviewItem => ({
      id: dto.id,
      title: dto.title_ru || dto.title || `#${dto.id}`,
      image: (device === "phone" ? dto.mobile_image : null) || dto.desktop_image || null,
    });

    switch (source.type) {
      case "slider": {
        // the two old top placements are one list now
        const top = source.bannerPlacement === "site_home" || source.bannerPlacement === "app_home";
        const params = (placement: string) => ({
          placement,
          is_visible: true,
          status: "active",
          page_size: 6,
        });
        let data: Paginated<PreviewBannerDto>;
        try {
          data = await api.get("/banners/", params(top ? "home_top" : source.bannerPlacement));
        } catch (error) {
          if (!top) throw error;
          data = await api.get("/banners/", params(source.bannerPlacement));
        }
        return data.results.map(banner);
      }
      case "banner":
        if (source.bannerId === null) return [];
        return [banner(await api.get<PreviewBannerDto>(`/banners/${source.bannerId}/`))];
      case "categories": {
        const data = await api.get<Paginated<PreviewCategoryDto>>("/categories/", {
          is_active: true,
          ordering: "position",
          page_size: 12,
        });
        return data.results.map((dto) => ({
          id: dto.id,
          title: dto.name,
          image: dto.icon || dto.image || null,
        }));
      }
      case "brands": {
        const data = await api.get<Paginated<PreviewCategoryDto>>("/brands/", {
          is_visible: true,
          page_size: 12,
        });
        return data.results.map((dto) => ({
          id: dto.id,
          title: dto.name,
          image: dto.image || null,
        }));
      }
      case "badge_products": {
        if (source.badgeId === null) return [];
        const data = await api.get<Paginated<PreviewProductDto>>("/products/", {
          badge: source.badgeId,
          page_size: 6,
        });
        return data.results.map(product);
      }
      case "sale_products": {
        let id = source.saleId;
        if (id === null) {
          const main = await api.get<Paginated<{ id: number }>>("/sales/", {
            is_main: true,
            page_size: 1,
          });
          id = main.results[0]?.id ?? null;
        }
        if (id === null) return [];
        const sale = await api.get<{ products?: PreviewProductDto[] }>(`/sales/${id}/`);
        return (sale.products ?? []).slice(0, 6).map(product);
      }
      case "new_products": {
        const data = await api.get<Paginated<PreviewProductDto>>("/products/", {
          ordering: "-created_at",
          page_size: 6,
        });
        return data.results.map(product);
      }
      case "bestsellers":
      case "all_products": {
        const data = await api.get<Paginated<PreviewProductDto>>("/products/", { page_size: 6 });
        return data.results.map(product);
      }
      case "adds_brands": {
        const data = await api.get<Paginated<PreviewCategoryDto>>("/adds-brands/", {
          is_visible: true,
          page_size: 4,
        });
        return data.results.map((dto) => ({ id: dto.id, title: dto.name, image: null }));
      }
      case "pages":
        return source.pages.map((page, index) => ({
          id: index,
          title: page.titleRu || page.titleUz || page.path,
          image: null,
        }));
      default:
        // articles and videos: nothing to draw from the lists above
        return [];
    }
  },

  /** Banners for the "banner" block select */
  async banners(): Promise<SourceOption[]> {
    const data = await api.get<Paginated<SourceRefDto>>("/banners/", {
      is_visible: true,
      page_size: 100,
    });
    return data.results.map(toOption);
  },

  /** Tags for the "badge_products" block select */
  async badges(): Promise<SourceOption[]> {
    const data = await api.get<Paginated<SourceRefDto>>("/product-badges/", { page_size: 100 });
    return data.results.map(toOption);
  },

  /** Sales for the "sale_products" block select */
  async sales(): Promise<SourceOption[]> {
    const data = await api.get<Paginated<SourceRefDto>>("/sales/", { page_size: 100 });
    return data.results.map(toOption);
  },
};
