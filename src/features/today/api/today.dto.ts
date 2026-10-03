/** Raw shape of GET /admin/today/ — only the mapper touches this. */

import type { OrderListDto } from "@/features/orders";
import type { AttentionItem } from "../model/types";

export interface TodayDto {
  now: string;
  cards: {
    today_orders: number;
    today_total: number;
    today_customers: number;
    pending: number;
    stale_pending: number;
    stale_minutes: number;
    collecting: number;
    delivering: number;
  };
  attention: { total: number; banner_days: number; items: AttentionItem[] };
  catalog: {
    published: number;
    draft: number;
    review: number;
    incomplete: number;
    no_translation: number;
    no_image: number;
    no_characteristics: number;
    out_of_stock: number;
  };
  orders_chart: {
    days: number;
    count: number;
    average_per_day: number;
    points: { date: string; count: number; total: number }[];
  };
  recent_orders: OrderListDto[];
}
