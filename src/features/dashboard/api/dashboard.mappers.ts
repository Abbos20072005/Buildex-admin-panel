import type { Query } from "@/shared/api";
import { mapOrder } from "@/features/orders";
import type { Dashboard, DashboardParams, Kpi } from "../model/types";
import type { DashboardDto, KpiDto } from "./dashboard.dto";

const kpi = (dto: KpiDto): Kpi => ({ value: dto.value ?? 0, change: dto.change ?? null });

export function paramsToQuery(params: DashboardParams): Query {
  return {
    days: params.days,
    period: params.period,
    months: params.months,
    low_stock: params.lowStock,
  };
}

export function mapDashboard(dto: DashboardDto): Dashboard {
  const {
    summary,
    delivered_orders: delivered,
    registrations,
    attention,
    customers,
    catalog,
  } = dto;
  return {
    summary: {
      days: summary.days,
      orders: kpi(summary.orders),
      revenue: kpi(summary.revenue),
      averageCheck: kpi(summary.average_check),
      newCustomers: kpi(summary.new_customers),
    },
    delivered: {
      period: delivered.period,
      count: delivered.count,
      revenue: delivered.revenue,
      change: delivered.change ?? null,
      points: delivered.points.map((point) => ({
        date: point.date,
        count: point.count,
        revenue: point.revenue,
        averageCheck: point.average_check,
      })),
    },
    registrations: {
      days: registrations.days,
      total: registrations.total,
      mobile: registrations.mobile,
      web: registrations.web,
      mobilePercent: registrations.mobile_percent,
      webPercent: registrations.web_percent,
      points: registrations.points,
    },
    recentOrders: dto.recent_orders.map(mapOrder),
    attention: {
      total: attention.total,
      outOfStock: attention.out_of_stock,
      outOfStockCategories: attention.out_of_stock_categories ?? [],
      stalePendingOrders: attention.stale_pending_orders,
      pendingHours: attention.pending_hours,
      unansweredQuestions: attention.unanswered_questions,
      unansweredChats: attention.unanswered_chats,
      moderationQueue: attention.moderation_queue,
      lastStockSync: attention.last_stock_sync ?? null,
    },
    customers: {
      total: customers.total,
      individual: customers.individual,
      b2b: customers.b2b,
      unverified: customers.unverified,
      active: customers.active,
      repeatPurchasePercent: customers.repeat_purchase_percent,
      blocked: customers.blocked,
    },
    catalog: {
      total: catalog.total,
      inStock: catalog.in_stock,
      lowStock: catalog.low_stock,
      outOfStock: catalog.out_of_stock,
      incomplete: catalog.incomplete,
      inactive: catalog.inactive,
      lowStockThreshold: catalog.low_stock_threshold,
    },
    revenue: dto.revenue,
  };
}
