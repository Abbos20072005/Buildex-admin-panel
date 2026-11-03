import { api, type DownloadedFile, type Page, type Paginated, type Query } from "@/shared/api";

export type FunnelChannel = "all" | "site" | "app";

/** Sortable columns of the table: the keys the API takes in `ordering`. */
export type FunnelSortKey =
  "views" | "add_to_cart" | "checkout_start" | "purchases" | "incomplete" | "completion_rate";

export interface FunnelFilters {
  /** last N days, or an exact range (both days included) */
  period: { kind: "days"; days: number } | { kind: "range"; from: string; to: string };
  channel: FunnelChannel;
  search: string;
  /** `null` — the API default (most viewed first) */
  sort: { key: FunnelSortKey; order: "ascend" | "descend" } | null;
}

export interface FunnelRow {
  id: number;
  name: string;
  articulCode: string | null;
  image: string | null;
  views: number;
  addToCart: number;
  checkoutStart: number;
  purchases: number;
  /** `checkout_start − purchases`; negative when more were bought than started */
  incomplete: number;
  /** percent; `null` when nobody started a checkout (shown as a dash, not 0%) */
  completionRate: number | null;
  /** completed orders without a channel (made by an operator, old app versions) */
  otherPurchases: number;
}

/* ---------- raw shape of GET /admin/analytics/product-funnel/ ---------- */

interface FunnelRowDto {
  id: number;
  name: string | null;
  articul_code: string | null;
  image: string | null;
  views: number;
  add_to_cart: number;
  checkout_start: number;
  purchases: number;
  incomplete: number;
  completion_rate: number | null;
  other_purchases: number;
}

/** The filters as the API wants them; the same for the table and the Excel file. */
function toQuery(filters: FunnelFilters): Query {
  const { period, channel, search, sort } = filters;
  return {
    ...(period.kind === "days"
      ? { days: period.days }
      : { date_from: period.from, date_to: period.to }),
    channel: channel === "all" ? undefined : channel,
    search: search.trim() || undefined,
    ordering: sort ? `${sort.order === "descend" ? "-" : ""}${sort.key}` : undefined,
  };
}

export const productFunnelApi = {
  /** GET /admin/analytics/product-funnel/ — one page of the table */
  async list(filters: FunnelFilters, page: number, pageSize: number): Promise<Page<FunnelRow>> {
    const dto = await api.get<Paginated<FunnelRowDto>>("/analytics/product-funnel/", {
      ...toQuery(filters),
      page,
      page_size: pageSize,
    });
    return {
      total: dto.count,
      items: dto.results.map((item) => ({
        id: item.id,
        name: item.name ?? "",
        articulCode: item.articul_code,
        image: item.image,
        views: item.views,
        addToCart: item.add_to_cart,
        checkoutStart: item.checkout_start,
        purchases: item.purchases,
        incomplete: item.incomplete,
        completionRate: item.completion_rate,
        otherPurchases: item.other_purchases,
      })),
    };
  },

  /** GET /admin/analytics/product-funnel/export/ — the same filter, every row, as an XLSX */
  async exportXlsx(filters: FunnelFilters, language: string): Promise<DownloadedFile> {
    return api.download("/analytics/product-funnel/export/", {
      ...toQuery(filters),
      language: language === "uz" ? "uz" : "ru",
    });
  },
};
