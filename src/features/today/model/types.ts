import type { Order } from "@/features/orders";

/** Kind of an "attention" row; the texts are written on the frontend by this key. */
export type AttentionKey =
  | "stale_pending_orders"
  | "refund_pending_orders"
  | "unassigned_orders"
  | "out_of_stock_products"
  | "no_price_products"
  | "review_products"
  | "unanswered_questions"
  | "unanswered_chats"
  | "moderation_queue"
  | "expiring_banners"
  | "draft_notifications";

export type AttentionGroup = "orders" | "catalog" | "feedback" | "content";
export type AttentionLevel = "danger" | "warning" | "info";

export interface AttentionObject {
  id: number;
  name: string | null;
  /** ISO time, Tashkent, no timezone */
  date: string | null;
}

export interface AttentionItem {
  key: AttentionKey;
  group: AttentionGroup;
  level: AttentionLevel;
  count: number;
  /** only for refund_pending_orders: the orders' total */
  amount: number | null;
  /** date of the most urgent object */
  date: string | null;
  /** up to 3 most urgent objects */
  objects: AttentionObject[];
}

export interface TodayPoint {
  /** YYYY-MM-DD */
  date: string;
  count: number;
  total: number;
}

export interface Today {
  /** server time (Tashkent) — all "7 hours ago" / "2 days left" are counted from it */
  now: string;
  cards: {
    todayOrders: number;
    todayTotal: number;
    todayCustomers: number;
    pending: number;
    stalePending: number;
    staleMinutes: number;
    collecting: number;
    delivering: number;
  };
  attention: { total: number; bannerDays: number; items: AttentionItem[] };
  catalog: {
    published: number;
    draft: number;
    review: number;
    incomplete: number;
    noTranslation: number;
    noImage: number;
    noCharacteristics: number;
    outOfStock: number;
  };
  ordersChart: { days: number; count: number; averagePerDay: number; points: TodayPoint[] };
  recentOrders: Order[];
}
