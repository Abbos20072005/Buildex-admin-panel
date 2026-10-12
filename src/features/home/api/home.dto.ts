/** Raw shape of /admin/home-blocks/ and /admin/home-page/ — only the mappers touch this. */

export interface SourceRefDto {
  id: number;
  name?: string | null;
  title?: string | null;
  code?: string | null;
}

export interface PageLinkDto {
  title_ru: string;
  title_uz?: string | null;
  title_en?: string | null;
  path: string;
}

export interface HomeBlockDto {
  id: number;
  type: string;
  title: string;
  title_uz?: string | null;
  title_ru: string;
  title_en?: string | null;
  position: number;
  is_visible: boolean;
  show_on_site: boolean;
  show_in_app: boolean;
  banner_placement?: string | null;
  banner?: SourceRefDto | null;
  badge?: SourceRefDto | null;
  sale?: SourceRefDto | null;
  days?: number | null;
  pages?: PageLinkDto[] | null;
  items_count: number;
  items_total?: number | null;
  status: "visible" | "hidden" | "rule_hidden";
}

/** The little the preview reads from the ordinary lists (banners, categories, brands, products). */
export interface PreviewBannerDto {
  id: number;
  title?: string | null;
  title_ru?: string | null;
  desktop_image?: string | null;
  mobile_image?: string | null;
}

export interface PreviewCategoryDto {
  id: number;
  name: string;
  icon?: string | null;
  image?: string | null;
}

export interface PreviewProductDto {
  id: number;
  name: string;
  images?: { image: string }[];
  price?: number | null;
  discount_price?: number | null;
}

export interface HomePageDto {
  hide_out_of_stock: boolean;
  hide_stale_price: boolean;
  min_products: number;
  personal_feed_enabled: boolean;
  personal_feed_holdout_percent: number;
  published_at: string | null;
  published_by: { id: number; username: string; full_name: string } | null;
  has_changes: boolean;
}
