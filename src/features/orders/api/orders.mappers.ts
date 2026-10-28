import type { Query } from "@/shared/api";
import type {
  CustomerInfo,
  Fulfillment,
  Manager,
  Order,
  OrderComment,
  OrderDetail,
  OrderFilters,
  OrderPatch,
  OrderStats,
  OrderStatus,
  PayStatus,
  PayType,
  PickupInfo,
} from "../model/types";
import type {
  CustomerDto,
  ManagerDto,
  OrderCommentDto,
  OrderDto,
  OrderListDto,
  OrderStatsDto,
} from "./orders.dto";

/* ---------- enums ---------- */

const STATUS_FROM_API: Record<number, OrderStatus> = {
  0: "new",
  1: "assembling",
  2: "onTheWay",
  3: "delivered",
  4: "cancelled",
};
const STATUS_TO_API: Record<OrderStatus, number> = {
  new: 0,
  assembling: 1,
  onTheWay: 2,
  delivered: 3,
  cancelled: 4,
};

const PAY_STATUS_FROM_API: Record<number, PayStatus> = {
  0: "pending",
  1: "hold",
  2: "paid",
  3: "cancelled",
};
const PAY_STATUS_TO_API: Record<PayStatus, number> = { pending: 0, hold: 1, paid: 2, cancelled: 3 };

function payTypeFromApi(
  type: number | null | undefined,
  method: string | null | undefined,
): PayType | null {
  switch (type) {
    case 1:
      return "click";
    case 2:
      return "payme";
    case 3:
      return "uzum";
    case 4:
      return method === "card" ? "receiptCard" : method === "cash" ? "receiptCash" : "receipt";
    default:
      return null;
  }
}

function payTypeToQuery(type: PayType): Query {
  switch (type) {
    case "click":
      return { payment_type: 1 };
    case "payme":
      return { payment_type: 2 };
    case "uzum":
      return { payment_type: 3 };
    case "receiptCash":
      return { payment_type: 4, payment_method: "cash" };
    case "receiptCard":
      return { payment_type: 4, payment_method: "card" };
    default:
      return { payment_type: 4 };
  }
}

const num = (value: unknown) => Number(value ?? 0) || 0;

/* ---------- DTO → UI ---------- */

export function mapOrder(dto: OrderListDto): Order {
  const fulfillment: Fulfillment = dto.delivery_type === 1 ? "pickup" : "delivery";
  return {
    id: dto.id,
    createdAt: dto.created_at,
    updatedAt: dto.updated_at ?? null,
    customer: {
      id: dto.customer?.id ?? null,
      name: dto.customer?.full_name?.trim() || dto.receiver_name || "—",
      phone: dto.customer?.phone_number || dto.receiver_phone || "",
    },
    receiver: { name: dto.receiver_name ?? null, phone: dto.receiver_phone ?? null },
    status: STATUS_FROM_API[dto.status] ?? "new",
    payStatus: PAY_STATUS_FROM_API[dto.payment_status ?? 0] ?? "pending",
    payType: payTypeFromApi(dto.payment_type, dto.payment_method),
    fulfillment,
    channel: dto.channel ? (dto.channel === "site" ? "site" : "app") : null,
    itemsCount: dto.items_count ?? 0,
    total: num(dto.total_price),
    subtotal: num(dto.products_total_price),
    saved: num(dto.saved_price),
    deliveryCost: num(dto.delivery_price),
    manager: dto.manager ? { id: dto.manager.id, name: dto.manager.full_name } : null,
    store: dto.pickup_store
      ? {
          names: { uz: dto.pickup_store.name_uz ?? "", ru: dto.pickup_store.name_ru ?? "" },
          expired: dto.pickup_expired ?? false,
        }
      : null,
  };
}

export function mapManager(dto: ManagerDto): Manager {
  return { id: dto.id, name: dto.full_name, active: dto.is_active ?? true };
}

/** "First Last", or the username when both names are empty */
export function mapComment(dto: OrderCommentDto): OrderComment {
  const author = dto.author;
  const fullName = [author?.first_name, author?.last_name].filter(Boolean).join(" ").trim();
  return {
    id: dto.id,
    author: author ? fullName || author.username : null,
    text: dto.text,
    isSystem: dto.is_system,
    createdAt: dto.created_at,
  };
}

/** "41.31" or 41.31 → 41.31; anything else is no coordinate. */
const coordinate = (value: string | number | null | undefined) => {
  if (value === null || value === undefined || value === "") return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
};

/**
 * The pickup store: the snapshot taken when the order was placed (so a later edit of the store
 * does not change an old order); an old order without one falls back to the store as it is now.
 */
function pickupOf(dto: OrderDto): PickupInfo | null {
  const store = dto.pickup_store;
  const branch = dto.pickup_branch;
  if (!store && !branch) return null;
  const name = branch?.name ?? "";
  const address = branch?.address ?? "";
  return {
    names: { uz: store?.name_uz || name, ru: store?.name_ru || name },
    addresses: { uz: store?.address_uz || address, ru: store?.address_ru || address },
    landmarks: { uz: store?.landmark_uz ?? "", ru: store?.landmark_ru ?? "" },
    phone: store?.phone || branch?.phone_number || "",
    latitude: coordinate(store?.latitude),
    longitude: coordinate(store?.longitude),
    deadline: dto.pickup_deadline ?? null,
    expired: dto.pickup_expired ?? false,
    readyAt: dto.ready_for_pickup_at ?? null,
  };
}

export function mapOrderDetail(dto: OrderDto): OrderDetail {
  const items = (dto.items ?? []).map((item) => ({
    id: item.id,
    productId: item.product.id,
    name: item.product.name,
    code: item.product.product_code,
    price: num(item.product.price),
    discountPrice: item.product.discount_price != null ? num(item.product.discount_price) : null,
    qty: item.quantity ?? 1,
  }));
  const location = dto.order_location;
  const promo = dto.promocode;

  return {
    ...mapOrder(dto),
    itemsCount: dto.items_count ?? items.length,
    manager: dto.manager ? mapManager(dto.manager) : null,
    comments: (dto.comments ?? []).map(mapComment),
    items,
    address: location
      ? {
          name: location.name,
          location: location.location_name,
          lat: location.latitude,
          lng: location.longitude,
        }
      : null,
    pickup: pickupOf(dto),
    promocode: promo
      ? {
          code: promo.code,
          name: promo.name,
          percent: promo.discount_precent,
          amount: promo.discount_price,
          expiresAt: promo.expires_at ?? null,
        }
      : null,
    ofdUrl: dto.ofd_url || null,
    yandexStatus: dto.yandex_claim_status || null,
    yandexClaimId: dto.yandex_claim_id || null,
    holdId: dto.hold_id ?? null,
  };
}

export function mapOrderStats(dto: OrderStatsDto): OrderStats {
  return {
    total: num(dto.total),
    pending: num(dto.pending),
    collecting: num(dto.collecting),
    delivering: num(dto.delivering),
    completed: num(dto.completed),
    canceled: num(dto.canceled),
    paid: num(dto.paid),
    revenue: num(dto.revenue),
    averageCheck: num(dto.average_check),
  };
}

export function mapCustomer(dto: CustomerDto): CustomerInfo {
  return {
    id: dto.id,
    name: dto.full_name ?? "",
    phone: dto.phone_number ?? "",
    email: dto.email || null,
    role: dto.role || "user",
    verified: !!dto.verified,
    blocked: !!dto.is_blocked,
    ordersCount: dto.orders_count ?? 0,
    totalPurchase: num(dto.total_purchase),
    createdAt: dto.created_at ?? null,
  };
}

/* ---------- UI → API ---------- */

export function filtersToQuery(filters: OrderFilters): Query {
  return {
    search: filters.search?.trim() || undefined,
    customer: filters.customer,
    status: filters.status?.length ? filters.status.map((s) => STATUS_TO_API[s]) : undefined,
    ...(filters.payType ? payTypeToQuery(filters.payType) : {}),
    payment_status: filters.payStatus ? PAY_STATUS_TO_API[filters.payStatus] : undefined,
    delivery_type: filters.fulfillment ? (filters.fulfillment === "pickup" ? 1 : 0) : undefined,
    pickup_branch: filters.branch,
    from_created: filters.from,
    to_created: filters.to,
    min_total: filters.minTotal,
    max_total: filters.maxTotal,
  };
}

export function patchToDto(patch: OrderPatch): Record<string, unknown> {
  const body: Record<string, unknown> = {};
  if (patch.status) body.status = STATUS_TO_API[patch.status];
  if (patch.payStatus) body.payment_status = PAY_STATUS_TO_API[patch.payStatus];
  if (patch.manager !== undefined) body.manager = patch.manager ? { id: patch.manager } : null;
  return body;
}
