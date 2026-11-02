import type { Fulfillment, OrderStats, OrderStatus, PayStatus, PayType } from "./types";

export const ORDER_STATUSES: OrderStatus[] = [
  "new",
  "confirmed",
  "assembling",
  "onTheWay",
  "readyForPickup",
  "delivered",
  "cancelled",
];
export const PAY_STATUSES: PayStatus[] = ["pending", "hold", "paid", "cancelled"];
export const PAY_TYPES: PayType[] = ["click", "payme", "uzum", "receiptCash", "receiptCard"];

/**
 * The normal life cycle of an order; "cancelled" is a side exit. A delivery goes through
 * "onTheWay", a pickup through "readyForPickup". An online payment moves an order from "new"
 * straight to "assembling", so "confirmed" may be skipped.
 */
export const orderFlow = (fulfillment: Fulfillment): OrderStatus[] =>
  fulfillment === "pickup"
    ? ["new", "confirmed", "assembling", "readyForPickup", "delivered"]
    : ["new", "confirmed", "assembling", "onTheWay", "delivered"];

/** The statuses an order of this kind can be set to by hand (no "onTheWay" for a pickup, …). */
export const statusesFor = (fulfillment: Fulfillment): OrderStatus[] => [
  ...orderFlow(fulfillment),
  "cancelled",
];

/** Status the primary action button moves the order to (none when the order is closed). */
export const nextStatus = (
  status: OrderStatus,
  fulfillment: Fulfillment,
): OrderStatus | undefined => {
  const flow = orderFlow(fulfillment);
  const index = flow.indexOf(status);
  return index >= 0 ? flow[index + 1] : undefined;
};

export type OrderTab = "all" | OrderStatus;

export const ORDER_TABS: OrderTab[] = ["all", ...ORDER_STATUSES];

/**
 * Which field of GET /orders/stats/ holds the counter of each tab. The API has no counter for
 * "ready for pickup" yet: that tab shows none.
 */
export const TAB_STAT_FIELD: Partial<Record<OrderTab, keyof OrderStats>> = {
  all: "total",
  new: "pending",
  confirmed: "confirmed",
  assembling: "collecting",
  onTheWay: "delivering",
  delivered: "completed",
  cancelled: "canceled",
};

/** antd <Tag color> per status */
export const STATUS_COLOR: Record<OrderStatus, string> = {
  new: "gold",
  confirmed: "cyan",
  assembling: "purple",
  onTheWay: "blue",
  readyForPickup: "geekblue",
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
