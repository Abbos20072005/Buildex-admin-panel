import type { CustomerRole } from "../model/types";

export interface CustomerAddressDto {
  id: number;
  name: string;
  location_name?: string | null;
  is_default?: boolean;
}

/** Schemas `Customer` (list) and `CustomerDetail` (adds `addresses`). */
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
}

export interface CustomerStatsDto {
  total: number;
  active: number;
  b2b: number;
  blocked: number;
}
