import type { Order } from "@/features/orders";

/** `week` — 7 daily points, `month` — 30 */
export type Period = "week" | "month";

/** Query of GET /admin/dashboard/ — every widget depends on its own parameter. */
export interface DashboardParams {
  /** KPI cards window, 1–365 */
  days: number;
  /** delivered-orders and registrations charts */
  period: Period;
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
    orders: Kpi;
    revenue: Kpi;
    averageCheck: Kpi;
    newCustomers: Kpi;
  };
  delivered: {
    period: Period;
    count: number;
    revenue: number;
    change: number | null;
    points: DeliveredPoint[];
  };
  registrations: {
    days: number;
    total: number;
    mobile: number;
    web: number;
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
