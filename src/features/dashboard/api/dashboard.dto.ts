/** Raw shape of GET /admin/dashboard/ — only the mapper touches this. */

import type { OrderListDto } from "@/features/orders";

export interface KpiDto {
  value: number;
  change: number | null;
}

export interface DashboardDto {
  summary: {
    days: number;
    orders: KpiDto;
    revenue: KpiDto;
    average_check: KpiDto;
    new_customers: KpiDto;
  };
  delivered_orders: {
    period: "week" | "month";
    count: number;
    revenue: number;
    change: number | null;
    points: { date: string; count: number; revenue: number; average_check: number }[];
  };
  registrations: {
    days: number;
    total: number;
    mobile: number;
    web: number;
    mobile_percent: number;
    web_percent: number;
    points: { date: string; count: number }[];
  };
  recent_orders: OrderListDto[];
  attention: {
    total: number;
    out_of_stock: number;
    out_of_stock_categories: string[];
    stale_pending_orders: number;
    pending_hours: number;
    unanswered_questions: number;
    unanswered_chats: number;
    moderation_queue: number;
    last_stock_sync: string | null;
  };
  customers: {
    total: number;
    individual: number;
    b2b: number;
    unverified: number;
    active: number;
    repeat_purchase_percent: number;
    blocked: number;
  };
  catalog: {
    total: number;
    in_stock: number;
    low_stock: number;
    out_of_stock: number;
    incomplete: number;
    inactive: number;
    low_stock_threshold: number;
  };
  revenue: {
    b2b: number;
    individual: number;
    months: { month: string; b2b: number; individual: number }[];
  };
}
