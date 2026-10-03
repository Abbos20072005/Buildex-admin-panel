import { mapOrder } from "@/features/orders";
import type { Today } from "../model/types";
import type { TodayDto } from "./today.dto";

export function mapToday(dto: TodayDto): Today {
  const { cards, catalog, orders_chart: chart } = dto;
  return {
    now: dto.now,
    cards: {
      todayOrders: cards.today_orders,
      todayTotal: cards.today_total,
      todayCustomers: cards.today_customers,
      pending: cards.pending,
      stalePending: cards.stale_pending,
      staleMinutes: cards.stale_minutes,
      collecting: cards.collecting,
      delivering: cards.delivering,
    },
    attention: {
      total: dto.attention.total,
      bannerDays: dto.attention.banner_days,
      items: dto.attention.items,
    },
    catalog: {
      published: catalog.published,
      draft: catalog.draft,
      review: catalog.review,
      incomplete: catalog.incomplete,
      noTranslation: catalog.no_translation,
      noImage: catalog.no_image,
      noCharacteristics: catalog.no_characteristics,
      outOfStock: catalog.out_of_stock,
    },
    ordersChart: {
      days: chart.days,
      count: chart.count,
      averagePerDay: chart.average_per_day,
      points: chart.points,
    },
    recentOrders: dto.recent_orders.map(mapOrder),
  };
}
