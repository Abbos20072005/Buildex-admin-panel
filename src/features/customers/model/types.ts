/** `user` — oddiy (jismoniy shaxs), `prorab` — B2B mijoz. */
export type CustomerRole = "user" | "prorab";

export const CUSTOMER_ROLES: CustomerRole[] = ["user", "prorab"];

/** Where the customer registered: the site or one of the mobile apps. */
export type CustomerChannel = "site" | "app";

export const CUSTOMER_CHANNELS: CustomerChannel[] = ["site", "app"];

/** The customer's tier for the marketing / support team (set by hand in the admin). */
export type CustomerSegment = "regular" | "big" | "vip";

export const CUSTOMER_SEGMENTS: CustomerSegment[] = ["regular", "big", "vip"];

export interface CustomerAddress {
  id: number;
  name: string;
  locationName: string;
  isDefault: boolean;
  apartment: string;
  entrance: string;
  floor: string;
  intercom: string;
  courierComment: string;
}

export type ConsentKey = "push" | "sms" | "email";

export const CONSENT_KEYS: ConsentKey[] = ["push", "sms", "email"];

export interface Consent {
  enabled: boolean;
  /** last change of the choice (made by the customer only) */
  changedAt: string | null;
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

  /* — below: not in the API yet (see docs/customers-backend-request.md); empty until it is — */
  isDeleted: boolean;
  segment: CustomerSegment | null;
  tags: string[];
  channel: CustomerChannel | null;
  lastOrderAt: string | null;
  returnsCount: number | null;
  language: string | null;
  /** "iOS", "Android" or "Sayt" of the last login */
  lastLoginPlatform: string | null;
  activeDevices: number | null;
  consents: Partial<Record<ConsentKey, Consent>>;
}

/** What the "new customer" form sends (POST /admin/customers/). */
export interface CustomerInput {
  fullName: string;
  phone: string;
  email: string;
  role: CustomerRole;
  verified: boolean;
  isBlocked: boolean;
}

/** The fields the profile card of a customer page may change. */
export interface CustomerProfilePatch {
  fullName?: string;
  segment?: CustomerSegment | null;
  tags?: string[];
}

/** GET /admin/customers/stats/ */
export interface CustomerStats {
  total: number;
  /** logged in within the last 30 days */
  active: number;
  b2b: number;
  blocked: number;
  /** not in the API yet */
  ordered30d?: number;
  deleted?: number;
}

export interface CustomerFilters {
  search?: string;
  role?: CustomerRole;
  verified?: boolean;
  isBlocked?: boolean;
  /** logged in within 30 days */
  isActive?: boolean;
  hasOrders?: boolean;
  /** registered: YYYY-MM-DD, both borders included */
  from?: string;
  to?: string;

  /* — below: the API does not filter by them yet — */
  isDeleted?: boolean;
  segment?: CustomerSegment;
  channel?: CustomerChannel;
  ordersMin?: number;
  ordersMax?: number;
  purchaseMin?: number;
  purchaseMax?: number;
  lastOrderFrom?: string;
  lastOrderTo?: string;
  hasReturns?: boolean;
}

export interface CustomerListParams {
  filters: CustomerFilters;
  page: number;
  pageSize: number;
}

/** A line of the "Jurnal" tab: who changed the customer's role, and why. */
export interface RoleHistoryEntry {
  id: number;
  oldRole: CustomerRole;
  newRole: CustomerRole;
  changedBy: string;
  reason: string;
  createdAt: string;
}

/** An internal note of the staff — never shown to the customer. */
export interface CustomerNote {
  id: number;
  author: string;
  text: string;
  createdAt: string;
}
