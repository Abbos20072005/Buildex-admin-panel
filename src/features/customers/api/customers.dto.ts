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
}

export interface ConsentDto {
  enabled: boolean;
  changed_at?: string | null;
}

/**
 * Schemas `Customer` (list) and `CustomerDetail` (adds `addresses`). The fields after
 * `addresses` are requested from the backend (docs/customers-backend-request.md): optional here.
 */
export interface CustomerDto {
  id: number;
  full_name?: string | null;
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
  last_login_platform?: string | null;
  active_devices?: number | null;
  consents?: { push?: ConsentDto; sms?: ConsentDto; email?: ConsentDto };
}

export interface CustomerStatsDto {
  total: number;
  active: number;
  b2b: number;
  blocked: number;
  ordered_30d?: number;
  deleted?: number;
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
