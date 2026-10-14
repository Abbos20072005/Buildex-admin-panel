import dayjs from "dayjs";
import { api, type Query } from "@/shared/api";
import type {
  CategoryShare,
  Metric,
  ProductRef,
  SalesAnalytics,
  SalesFilters,
  Share,
} from "../model/types";

/* ---------- raw shapes of GET /admin/analytics/sales/ ---------- */

interface MetricDto {
  value: number;
  change: number | null;
}
interface ShareDto {
  key: string;
  orders: number;
  revenue: number;
  orders_percent: number;
  revenue_percent: number;
}
interface ProductRefDto {
  id: number;
  name: string;
  product_code: string | null;
  articul_code: string | null;
}
interface SalesDto {
  summary: {
    days: number;
    date_from: string;
    date_to: string;
    revenue: MetricDto;
    orders: MetricDto;
    average_check: MetricDto;
    cancel_rate: MetricDto;
    refund_rate: MetricDto;
    repeat_rate: MetricDto;
  };
  chart: {
    points: {
      date: string;
      revenue: number;
      orders: number;
      previous_date?: string | null;
      previous_revenue?: number | null;
    }[];
  };
  channels: ShareDto[];
  categories: { category: { id: number; name: string }; revenue: number; percent: number }[];
  payment_methods: ShareDto[];
  delivery_types: ShareDto[];
  top_products: {
    product: ProductRefDto;
    quantity: number;
    revenue: number;
    change: number | null;
  }[];
  refunded_products: { product: ProductRefDto; quantity: number; orders: number }[];
  cohorts: {
    offsets: number;
    rows: { month: string; customers: number; percents: (number | null)[] }[];
  };
}

const metric = (dto: MetricDto): Metric => ({ value: dto.value, change: dto.change ?? null });
const share = (dto: ShareDto): Share => ({
  key: dto.key,
  orders: dto.orders,
  revenue: dto.revenue,
  ordersPercent: dto.orders_percent,
  revenuePercent: dto.revenue_percent,
});
const productRef = (dto: ProductRefDto): ProductRef => ({
  id: dto.id,
  name: dto.name,
  productCode: dto.product_code,
  articulCode: dto.articul_code,
});

/** The chosen period as the API wants it: `days`, or `date_from` + `date_to`. */
function toQuery({ period, channel, segment }: SalesFilters): Query {
  const range: Query =
    period.kind === "days"
      ? { days: period.days }
      : period.kind === "month"
        ? {
            date_from: dayjs().startOf("month").format("YYYY-MM-DD"),
            date_to: dayjs().format("YYYY-MM-DD"),
          }
        : { date_from: period.from, date_to: period.to };
  // "hammasi" is not sent at all (an empty value is a 400)
  return { ...range, channel, segment };
}

export const salesAnalyticsApi = {
  /** GET /admin/analytics/sales/ — not cached on the backend */
  async get(filters: SalesFilters): Promise<SalesAnalytics> {
    const dto = await api.get<SalesDto>("/analytics/sales/", toQuery(filters));
    return {
      summary: {
        days: dto.summary.days,
        dateFrom: dto.summary.date_from,
        dateTo: dto.summary.date_to,
        revenue: metric(dto.summary.revenue),
        orders: metric(dto.summary.orders),
        averageCheck: metric(dto.summary.average_check),
        cancelRate: metric(dto.summary.cancel_rate),
        refundRate: metric(dto.summary.refund_rate),
        repeatRate: metric(dto.summary.repeat_rate),
      },
      chart: dto.chart.points.map((point) => ({
        date: point.date,
        revenue: point.revenue,
        orders: point.orders,
        previousDate: point.previous_date ?? null,
        previousRevenue: point.previous_revenue ?? null,
      })),
      channels: dto.channels.map(share),
      categories: dto.categories.map((item): CategoryShare => ({
        id: item.category.id,
        name: item.category.name,
        revenue: item.revenue,
        percent: item.percent,
      })),
      paymentMethods: dto.payment_methods.map(share),
      deliveryTypes: dto.delivery_types.map(share),
      topProducts: dto.top_products.map((item) => ({
        product: productRef(item.product),
        quantity: item.quantity,
        revenue: item.revenue,
        change: item.change ?? null,
      })),
      refundedProducts: dto.refunded_products.map((item) => ({
        product: productRef(item.product),
        quantity: item.quantity,
        orders: item.orders,
      })),
      cohorts: dto.cohorts,
    };
  },
};
