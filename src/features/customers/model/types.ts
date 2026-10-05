/** `user` — oddiy (jismoniy shaxs), `prorab` — B2B mijoz. */
export type CustomerRole = "user" | "prorab";

export const CUSTOMER_ROLES: CustomerRole[] = ["user", "prorab"];

export interface CustomerAddress {
  id: number;
  name: string;
  locationName: string;
  isDefault: boolean;
}

export interface Customer {
  id: number;
  fullName: string;
  phone: string;
  email: string;
  role: CustomerRole;
  /** the phone number is confirmed */
  verified: boolean;
  isBlocked: boolean;
  avatar: string | null;
  lastLogin: string | null;
  ordersCount: number;
  /** total of all purchases, UZS */
  totalPurchase: number;
  createdAt: string;
  /** only in the detail (`GET customers/{id}/`) */
  addresses: CustomerAddress[];
}

/** What the editor sends (POST / PATCH /admin/customers/). */
export interface CustomerInput {
  fullName: string;
  phone: string;
  email: string;
  role: CustomerRole;
  verified: boolean;
  isBlocked: boolean;
}

/** GET /admin/customers/stats/ */
export interface CustomerStats {
  total: number;
  /** logged in within the last 30 days */
  active: number;
  b2b: number;
  blocked: number;
}

export interface CustomerFilters {
  search?: string;
  role?: CustomerRole;
  verified?: boolean;
  isBlocked?: boolean;
  /** logged in within 30 days */
  isActive?: boolean;
  hasOrders?: boolean;
  /** YYYY-MM-DD, both borders included */
  from?: string;
  to?: string;
}

export interface CustomerListParams {
  filters: CustomerFilters;
  page: number;
  pageSize: number;
}
