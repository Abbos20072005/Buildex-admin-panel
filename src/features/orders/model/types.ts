/** UI-side order models — mapped from the Dommaster Admin API in ../api/orders.mappers.ts */

/** StatusEnum: 0 Pending · 1 Collecting · 2 Delivering · 3 Completed · 4 Canceled */
export type OrderStatus = "new" | "assembling" | "onTheWay" | "delivered" | "cancelled";

/** PaymentStatusEnum: 0 Pending · 1 Hold · 2 Paid · 3 Cancelled */
export type PayStatus = "pending" | "hold" | "paid" | "cancelled";

/** PaymentTypeEnum 1 Click · 2 Payme · 3 Uzum · 4 on receipt (split by payment_method) */
export type PayType = "click" | "payme" | "uzum" | "receiptCash" | "receiptCard" | "receipt";

export type Fulfillment = "delivery" | "pickup";

export interface Order {
  id: number;
  createdAt: string;
  updatedAt: string | null;
  customer: { id: number | null; name: string; phone: string };
  receiver: { name: string | null; phone: string | null };
  status: OrderStatus;
  payStatus: PayStatus;
  payType: PayType | null;
  fulfillment: Fulfillment;
  /** where it was placed: the site or a mobile app */
  channel: "site" | "app" | null;
  itemsCount: number;
  total: number;
  subtotal: number;
  saved: number;
  deliveryCost: number;
  manager: { id: number; name: string } | null;
  /** the pickup store (shown in the list); null - a delivery */
  store: { names: { uz: string; ru: string }; expired: boolean } | null;
}

export interface OrderItem {
  id: number;
  productId: number;
  name: string;
  code: string | null;
  price: number;
  discountPrice: number | null;
  qty: number;
}

/** Staff member a customer's order is assigned to (not a login account). */
export interface Manager {
  id: number;
  name: string;
  active: boolean;
}

/** Internal note on an order — never shown to the customer. */
export interface OrderComment {
  id: number;
  /** display name of the admin who wrote it; null for system notes */
  author: string | null;
  text: string;
  isSystem: boolean;
  createdAt: string;
}

/** The store of a pickup order: as it was when the order was placed, with the keeping deadline. */
export interface PickupInfo {
  names: { uz: string; ru: string };
  addresses: { uz: string; ru: string };
  landmarks: { uz: string; ru: string };
  phone: string;
  latitude: number | null;
  longitude: number | null;
  /** the store keeps the order until this moment */
  deadline: string | null;
  /** ready for pickup and the deadline has passed */
  expired: boolean;
  readyAt: string | null;
}

export interface OrderDetail extends Order {
  manager: Manager | null;
  /** newest first */
  comments: OrderComment[];
  items: OrderItem[];
  address: { name: string; location: string | null; lat: number; lng: number } | null;
  /** the store a pickup order is collected from; null — a delivery */
  pickup: PickupInfo | null;
  promocode: {
    code: string;
    name: string;
    percent: number | null;
    amount: number | null;
    expiresAt: string | null;
  } | null;
  ofdUrl: string | null;
  yandexStatus: string | null;
  yandexClaimId: string | null;
  holdId: number | null;
}

export interface OrderStats {
  total: number;
  pending: number;
  collecting: number;
  delivering: number;
  completed: number;
  canceled: number;
  paid: number;
  revenue: number;
  averageCheck: number;
}

export interface OrderFilters {
  search?: string;
  /** orders of one customer */
  customer?: number;
  status?: OrderStatus[];
  payType?: PayType;
  payStatus?: PayStatus;
  fulfillment?: Fulfillment;
  branch?: number;
  /** YYYY-MM-DD */
  from?: string;
  /** YYYY-MM-DD */
  to?: string;
  minTotal?: number;
  maxTotal?: number;
}

export type OrderSort = "-created_at" | "created_at" | "-total_price" | "total_price";

export interface OrderPatch {
  status?: OrderStatus;
  payStatus?: PayStatus;
  /** manager id; null removes the assignment */
  manager?: number | null;
}

export interface Branch {
  id: number;
  name: string;
}

export interface CustomerInfo {
  id: number;
  name: string;
  phone: string;
  email: string | null;
  role: string;
  verified: boolean;
  blocked: boolean;
  ordersCount: number;
  totalPurchase: number;
  createdAt: string | null;
}
