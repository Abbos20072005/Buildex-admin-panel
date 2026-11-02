import { api } from "@/shared/api";

export type OrderStatusPeriod = "current_month" | "last_month" | "last_3_months" | "year";

export interface OrderStatusShare {
  /** order status code, 0–6 */
  status: number;
  count: number;
  percent: number;
}

export interface OrderStatuses {
  /** YYYY-MM-DD, both ends included */
  dateFrom: string;
  dateTo: string;
  total: number;
  /** always the 7 statuses in code order, zeros too */
  statuses: OrderStatusShare[];
}

export type PublishStatus = "draft" | "review" | "published";

export interface ProductStatuses {
  total: number;
  publish: { status: PublishStatus; count: number; percent: number }[];
  /** visible to customers (`is_active`) or not */
  activity: { active: boolean; count: number; percent: number }[];
}

/* ---------- raw shapes of GET /admin/dashboard/order-statuses/ and product-statuses/ ---------- */

interface OrderStatusesDto {
  date_from: string;
  date_to: string;
  total: number;
  statuses: OrderStatusShare[];
}
interface ProductStatusesDto {
  total: number;
  publish_statuses: { publish_status: PublishStatus; count: number; percent: number }[];
  activity: { is_active: boolean; count: number; percent: number }[];
}

export const statusesApi = {
  /** GET /admin/dashboard/order-statuses/ — orders created in the period, by their current status */
  async orders(period: OrderStatusPeriod): Promise<OrderStatuses> {
    const dto = await api.get<OrderStatusesDto>("/dashboard/order-statuses/", { period });
    return {
      dateFrom: dto.date_from,
      dateTo: dto.date_to,
      total: dto.total,
      statuses: dto.statuses,
    };
  },

  /** GET /admin/dashboard/product-statuses/ — all products now, no period */
  async products(): Promise<ProductStatuses> {
    const dto = await api.get<ProductStatusesDto>("/dashboard/product-statuses/");
    return {
      total: dto.total,
      publish: dto.publish_statuses.map((item) => ({
        status: item.publish_status,
        count: item.count,
        percent: item.percent,
      })),
      activity: dto.activity.map((item) => ({
        active: item.is_active,
        count: item.count,
        percent: item.percent,
      })),
    };
  },
};
