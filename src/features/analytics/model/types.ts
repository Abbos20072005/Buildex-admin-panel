/** "Kanal" filter: where the order was placed. */
export type SalesChannel = "site" | "ios" | "android";

/** "Segment" filter: PRO (prorab) customers or everyone else. */
export type SalesSegment = "b2b" | "individual";

/** The period chosen in the toolbar. */
export type SalesPeriod =
  { kind: "days"; days: number } | { kind: "month" } | { kind: "range"; from: string; to: string };

export interface SalesFilters {
  period: SalesPeriod;
  channel?: SalesChannel;
  segment?: SalesSegment;
}

/** A KPI and its change: percent (value metrics) or percentage points (rates); null — no basis. */
export interface Metric {
  value: number;
  change: number | null;
}

export interface ChartPoint {
  /** YYYY-MM-DD */
  date: string;
  revenue: number;
  orders: number;
  previousDate: string | null;
  previousRevenue: number | null;
}

/** One row of a share list (channels, payment methods, delivery types). */
export interface Share {
  key: string;
  orders: number;
  revenue: number;
  ordersPercent: number;
  revenuePercent: number;
}

export interface CategoryShare {
  id: number;
  name: string;
  revenue: number;
  percent: number;
}

export interface ProductRef {
  id: number;
  name: string;
  productCode: string | null;
  articulCode: string | null;
}

export interface TopProduct {
  product: ProductRef;
  quantity: number;
  revenue: number;
  change: number | null;
}

export interface RefundedProduct {
  product: ProductRef;
  quantity: number;
  orders: number;
}

export interface CohortRow {
  /** first day of the month, YYYY-MM-DD */
  month: string;
  customers: number;
  /** cumulative, one per following month; null — that month hasn't started */
  percents: (number | null)[];
}

/** GET /admin/analytics/sales/ — every widget of the page in one response. */
export interface SalesAnalytics {
  summary: {
    days: number;
    dateFrom: string;
    dateTo: string;
    revenue: Metric;
    orders: Metric;
    averageCheck: Metric;
    cancelRate: Metric;
    refundRate: Metric;
    repeatRate: Metric;
  };
  chart: ChartPoint[];
  channels: Share[];
  categories: CategoryShare[];
  paymentMethods: Share[];
  deliveryTypes: Share[];
  topProducts: TopProduct[];
  refundedProducts: RefundedProduct[];
  cohorts: { offsets: number; rows: CohortRow[] };
}
