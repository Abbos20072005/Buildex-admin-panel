import { ApiError } from "@/shared/api";
import type { OrderDetail, OrderItem } from "../model/types";

/** The IKPU code is 17 digits (tasnif.soliq.uz). */
export const IKPU_PATTERN = /^\d{17}$/;

/**
 * The lines without an IKPU code. A line whose code the API does not send (`undefined`) is not
 * counted: until the backend has the field nothing can be missing.
 */
export const itemsWithoutIkpu = (order: Pick<OrderDetail, "items">): OrderItem[] =>
  order.items.filter((item) => item.ikpuCode === "");

/**
 * The lines the server refused to confirm the order for: a 400 with `missing_ikpu`
 * ([{item_id, product: {id, name}}]). null - the error is something else.
 */
export function missingIkpuOfError(error: unknown): string[] | null {
  const body = error instanceof ApiError ? error.body : null;
  const list = (body as { missing_ikpu?: unknown } | null)?.missing_ikpu;
  if (!Array.isArray(list) || !list.length) return null;
  return list.map(
    (entry: { product?: { name?: string }; item_id?: number | null }) =>
      entry.product?.name ?? `#${entry.item_id ?? "?"}`,
  );
}

/** The code is edited only until the order is confirmed (a new order). */
export const canEditIkpu = (order: Pick<OrderDetail, "status">) => order.status === "new";
