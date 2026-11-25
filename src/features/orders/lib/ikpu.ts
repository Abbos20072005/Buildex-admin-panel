import type { OrderDetail, OrderItem } from "../model/types";

/** The IKPU code is 17 digits (tasnif.soliq.uz). */
export const IKPU_PATTERN = /^\d{17}$/;

/**
 * The lines without an IKPU code. A line whose code the API does not send (`undefined`) is not
 * counted: until the backend has the field nothing can be missing.
 */
export const itemsWithoutIkpu = (order: Pick<OrderDetail, "items">): OrderItem[] =>
  order.items.filter((item) => item.ikpuCode === "");

/** The code is edited only until the order is confirmed (a new order). */
export const canEditIkpu = (order: Pick<OrderDetail, "status">) => order.status === "new";
