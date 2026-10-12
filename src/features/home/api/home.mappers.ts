import type {
  BlockType,
  HomeBlock,
  HomeBlockInput,
  HomePageState,
  HomeRulesInput,
  PageLink,
  SourceRef,
} from "../model/types";
import type { HomeBlockDto, HomePageDto, PageLinkDto, SourceRefDto } from "./home.dto";

const mapRef = (dto: SourceRefDto | null | undefined): SourceRef | null =>
  dto ? { id: dto.id, name: dto.name || dto.title || dto.code || `#${dto.id}` } : null;

const mapPageLink = (dto: PageLinkDto): PageLink => ({
  titleRu: dto.title_ru,
  titleUz: dto.title_uz ?? "",
  titleEn: dto.title_en ?? "",
  path: dto.path,
});

export const mapBlock = (dto: HomeBlockDto): HomeBlock => ({
  id: dto.id,
  type: dto.type as BlockType,
  title: dto.title,
  titleRu: dto.title_ru,
  titleUz: dto.title_uz ?? "",
  titleEn: dto.title_en ?? "",
  position: dto.position,
  isVisible: dto.is_visible,
  showOnSite: dto.show_on_site,
  showInApp: dto.show_in_app,
  bannerPlacement: dto.banner_placement ?? "",
  banner: mapRef(dto.banner),
  badge: mapRef(dto.badge),
  sale: mapRef(dto.sale),
  days: dto.days ?? null,
  pages: (dto.pages ?? []).map(mapPageLink),
  itemsCount: dto.items_count,
  itemsTotal: dto.items_total ?? null,
  status: dto.status,
});

export const mapPageState = (dto: HomePageDto): HomePageState => ({
  hideOutOfStock: dto.hide_out_of_stock,
  hideStalePrice: dto.hide_stale_price,
  minProducts: dto.min_products,
  personalFeedEnabled: dto.personal_feed_enabled,
  personalFeedHoldoutPercent: dto.personal_feed_holdout_percent,
  publishedAt: dto.published_at,
  publishedBy: dto.published_by
    ? {
        id: dto.published_by.id,
        fullName: dto.published_by.full_name || dto.published_by.username,
      }
    : null,
  hasChanges: dto.has_changes,
});

export const rulesToDto = (input: HomeRulesInput) => ({
  hide_out_of_stock: input.hideOutOfStock,
  hide_stale_price: input.hideStalePrice,
  min_products: input.minProducts,
});

/** Only the source that belongs to the block type is sent; the backend clears the rest. */
function sourceToDto(input: HomeBlockInput): Record<string, unknown> {
  switch (input.type) {
    case "slider":
      return { banner_placement: input.bannerPlacement };
    case "banner":
      return { banner: input.bannerId === null ? null : { id: input.bannerId } };
    case "badge_products":
      return { badge: input.badgeId === null ? null : { id: input.badgeId } };
    case "sale_products":
      // null — the main sale
      return { sale: input.saleId === null ? null : { id: input.saleId } };
    case "new_products":
      return { days: input.days };
    case "pages":
      return {
        pages: input.pages.map((page) => ({
          title_ru: page.titleRu.trim(),
          title_uz: page.titleUz.trim(),
          title_en: page.titleEn.trim(),
          path: page.path.trim(),
        })),
      };
    default:
      return {};
  }
}

export const blockToDto = (input: HomeBlockInput, creating: boolean) => ({
  ...(creating ? { type: input.type } : {}),
  title_ru: input.titleRu.trim(),
  title_uz: input.titleUz.trim(),
  title_en: input.titleEn.trim(),
  show_on_site: input.showOnSite,
  show_in_app: input.showInApp,
  is_visible: input.isVisible,
  ...sourceToDto(input),
});
