import type { Order } from "@/features/orders";

/** What the API serves for a chart: `week` — 7 daily points, `month` — 30, `year` — 12 months */
export type ApiPeriod = "week" | "month" | "year";

/**
 * Chart span as the buttons show it. `quarter` (3 months) and `half` (6 months) are the last
 * points of the `year` response.
 */
export type Period = ApiPeriod | "quarter" | "half";

/** The KPI cards window: the last N days, or a chosen date range (both ends included). */
export type DateRange = { days: number } | { from: string; to: string };

/** Query of GET /admin/dashboard/ — every widget depends on its own parameter. */
export interface DashboardParams {
  /** KPI cards window; a custom range is sent as `date_from` + `date_to` instead of `days` */
  range: DateRange;
  /** delivered-orders and registrations charts */
  period: ApiPeriod;
  /** revenue chart, 1–24 months */
  months: number;
  /** a product with stock up to this is "low" */
  lowStock: number;
}

/** A KPI and its change against the previous period of the same length (null — no basis). */
export interface Kpi {
  value: number;
  change: number | null;
}

/** What one chart point stands for */
export type Step = "day" | "month";

export interface DeliveredPoint {
  /** YYYY-MM-DD */
  date: string;
  count: number;
  revenue: number;
  averageCheck: number;
}

export interface RegistrationPoint {
  date: string;
  count: number;
}

export interface MonthRevenue {
  /** first day of the month, YYYY-MM-DD */
  month: string;
  b2b: number;
  individual: number;
}

export interface Dashboard {
  summary: {
    days: number;
    /** YYYY-MM-DD, both ends included */
    dateFrom: string;
    dateTo: string;
    orders: Kpi;
    revenue: Kpi;
    averageCheck: Kpi;
    newCustomers: Kpi;
  };
  delivered: {
    period: Period;
    /** one point is a day or a month */
    step: Step;
    count: number;
    revenue: number;
    change: number | null;
    points: DeliveredPoint[];
  };
  registrations: {
    step: Step;
    days: number;
    total: number;
    mobile: number;
    web: number;
    /** false for 3 / 6 months: the API gives the mobile / web split only for the whole year */
    hasSplit: boolean;
    mobilePercent: number;
    webPercent: number;
    points: RegistrationPoint[];
  };
  recentOrders: Order[];
  attention: {
    total: number;
    outOfStock: number;
    outOfStockCategories: string[];
    stalePendingOrders: number;
    pendingHours: number;
    unansweredQuestions: number;
    unansweredChats: number;
    moderationQueue: number;
    /** ISO time of the last 1C stock sync; null — never */
    lastStockSync: string | null;
  };
  customers: {
    total: number;
    individual: number;
    b2b: number;
    unverified: number;
    active: number;
    repeatPurchasePercent: number;
    blocked: number;
  };
  catalog: {
    total: number;
    inStock: number;
    lowStock: number;
    outOfStock: number;
    incomplete: number;
    inactive: number;
    lowStockThreshold: number;
  };
  revenue: {
    b2b: number;
    individual: number;
    months: MonthRevenue[];
  };
}
