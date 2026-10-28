import type { CustomerRole } from "../model/types";

export interface CustomerAddressDto {
  id: number;
  name: string;
  location_name?: string | null;
  is_default?: boolean;
  apartment?: string | null;
  entrance?: string | null;
  floor?: string | null;
  intercom?: string | null;
  courier_comment?: string | null;
  /** "" — the customer himself */
  recipient_name?: string | null;
  recipient_phone?: string | null;
}

export interface ConsentDto {
  enabled: boolean;
  changed_at?: string | null;
}

/** Schemas `Customer` (list) and `CustomerDetail` (adds `addresses`). */
export interface CustomerDto {
  id: number;
  full_name?: string | null;
  /** masked: "+998 90 *** ** 67"; the whole number comes from POST reveal-phone/ */
  phone_number: string;
  email?: string | null;
  role?: CustomerRole;
  verified?: boolean;
  is_blocked?: boolean;
  avatar: string | null;
  last_login: string | null;
  orders_count: number;
  total_purchase: number;
  created_at: string;
  addresses?: CustomerAddressDto[];

  is_deleted?: boolean;
  segment?: string | null;
  tags?: string[];
  /** "site" | "ios" | "android" */
  registration_channel?: string | null;
  last_order_at?: string | null;
  returns_count?: number | null;
  language?: string | null;
  /** "site" | "ios" | "android" */
  last_login_platform?: string | null;
  active_devices?: number | null;
  /** not stored by the backend */
  consents?: { push?: ConsentDto; sms?: ConsentDto; email?: ConsentDto };
}

/** GET /admin/customers/{id}/activity/ */
export interface CustomerActivityDto {
  id: number;
  kind: string;
  text: string;
  /** "ios" | "android" | "site" | "admin" | null */
  channel?: string | null;
  actor?: { id: number; username?: string; full_name?: string | null } | null;
  created_at: string;
}

export interface CustomerStatsDto {
  total: number;
  active: number;
  b2b: number;
  blocked: number;
  ordered_30d?: number;
  deleted?: number;
}

/** POST /admin/customers/{id}/reveal-phone/ */
export interface RevealedPhoneDto {
  phone_number: string;
}

/** GET /admin/customers/{id}/role-history/ */
export interface RoleHistoryDto {
  id: number;
  old_value: CustomerRole;
  new_value: CustomerRole;
  changed_by?: { id: number; username?: string; full_name?: string | null } | null;
  reason?: string | null;
  created_at: string;
}

export interface CustomerNoteDto {
  id: number;
  author?: { full_name?: string | null; username?: string } | string | null;
  text: string;
  created_at: string;
}
