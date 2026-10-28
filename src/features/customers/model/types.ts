/** `user` — oddiy (jismoniy shaxs), `prorab` — B2B mijoz. */
export type CustomerRole = "user" | "prorab";

export const CUSTOMER_ROLES: CustomerRole[] = ["user", "prorab"];

/** The channel filter of the list: the site, or an app (both iOS and Android). */
export type CustomerChannel = "site" | "app";

export const CUSTOMER_CHANNELS: CustomerChannel[] = ["site", "app"];

/** Where the customer registered / last logged in, exactly as the API says. */
export type RegistrationChannel = "site" | "ios" | "android";

/** Languages of the app and the site (there is no English). */
export const CUSTOMER_LANGUAGES = ["uz", "ru"] as const;

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
  /** who receives the order; empty — the customer himself */
  recipientName: string;
  recipientPhone: string;
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

  /** deleted customers (soft delete) appear only under `?is_deleted=true` */
  isDeleted: boolean;
  segment: CustomerSegment | null;
  tags: string[];
  /** where the customer registered; null — unknown (old customers) */
  channel: RegistrationChannel | null;
  lastOrderAt: string | null;
  /** cancelled orders: there is no returns model */
  returnsCount: number | null;
  language: string | null;
  lastLoginPlatform: RegistrationChannel | null;
  /** devices with a push token */
  activeDevices: number | null;
  /** the backend does not store the consents: always empty */
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
  /** "" clears it */
  email?: string;
  language?: string;
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
  /** customers who ordered within the last 30 days (any order status) */
  ordered30d?: number;
  /** deleted customers; the other numbers do not count them */
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

/** `kind` of a line of the journal (GET customers/{id}/activity/). */
export type ActivityKind =
  | "registered"
  | "logged_in"
  | "updated"
  | "blocked"
  | "unblocked"
  | "role_changed"
  | "phone_revealed"
  | "logged_out_all"
  | "deleted";

/** A line of the "Jurnal" tab: what happened to the account, by whom and from where. */
export interface CustomerActivity {
  id: number;
  kind: string;
  /** a ready Uzbek sentence from the backend */
  text: string;
  /** the customer's own platform, "admin" for a staff member, null — unknown */
  channel: RegistrationChannel | "admin" | null;
  /** the staff member of an "admin" line */
  actor: string | null;
  createdAt: string;
}

/** An internal note of the staff — never shown to the customer. */
export interface CustomerNote {
  id: number;
  author: string;
  text: string;
  createdAt: string;
}
