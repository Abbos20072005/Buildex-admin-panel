import type { OrderStats, OrderStatus, PayStatus, PayType } from "./types";

export const ORDER_STATUSES: OrderStatus[] = [
  "new",
  "assembling",
  "onTheWay",
  "delivered",
  "cancelled",
];
export const PAY_STATUSES: PayStatus[] = ["pending", "hold", "paid", "cancelled"];
export const PAY_TYPES: PayType[] = ["click", "payme", "uzum", "receiptCash", "receiptCard"];

/** The normal life cycle of an order; "cancelled" is a side exit. */
export const ORDER_FLOW: OrderStatus[] = ["new", "assembling", "onTheWay", "delivered"];

/** Status the primary action button moves the order to. */
export const NEXT_STATUS: Partial<Record<OrderStatus, OrderStatus>> = {
  new: "assembling",
  assembling: "onTheWay",
  onTheWay: "delivered",
};

export type OrderTab = "all" | OrderStatus;

export const ORDER_TABS: OrderTab[] = ["all", ...ORDER_STATUSES];

/** Which field of GET /orders/stats/ holds the counter of each tab. */
export const TAB_STAT_FIELD: Record<OrderTab, keyof OrderStats> = {
  all: "total",
  new: "pending",
  assembling: "collecting",
  onTheWay: "delivering",
  delivered: "completed",
  cancelled: "canceled",
};

/** antd <Tag color> per status */
export const STATUS_COLOR: Record<OrderStatus, string> = {
  new: "gold",
  assembling: "purple",
  onTheWay: "blue",
  delivered: "green",
  cancelled: "red",
};

export const PAY_STATUS_COLOR: Record<PayStatus, string> = {
  pending: "orange",
  hold: "geekblue",
  paid: "green",
  cancelled: "default",
};

export const PAGE_SIZES = [20, 50, 100];
export const DEFAULT_PAGE_SIZE = 20;
