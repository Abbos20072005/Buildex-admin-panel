import type { Query } from "@/shared/api";
import type { Customer, CustomerFilters, CustomerInput, CustomerStats } from "../model/types";
import type { CustomerDto, CustomerStatsDto } from "./customers.dto";

export const mapCustomer = (dto: CustomerDto): Customer => ({
  id: dto.id,
  fullName: dto.full_name ?? "",
  phone: dto.phone_number,
  email: dto.email ?? "",
  role: dto.role ?? "user",
  verified: dto.verified ?? false,
  isBlocked: dto.is_blocked ?? false,
  avatar: dto.avatar || null,
  lastLogin: dto.last_login,
  ordersCount: dto.orders_count,
  totalPurchase: dto.total_purchase,
  createdAt: dto.created_at,
  addresses: (dto.addresses ?? []).map((address) => ({
    id: address.id,
    name: address.name,
    locationName: address.location_name ?? "",
    isDefault: address.is_default ?? false,
  })),
});

export const mapStats = (dto: CustomerStatsDto): CustomerStats => ({ ...dto });

export const filtersToQuery = (filters: CustomerFilters): Query => ({
  search: filters.search?.trim() || undefined,
  role: filters.role,
  verified: filters.verified,
  is_blocked: filters.isBlocked,
  is_active: filters.isActive,
  has_orders: filters.hasOrders,
  from_created: filters.from,
  to_created: filters.to,
});

/** An empty e-mail is sent as "" (the field accepts an empty string). */
export const inputToDto = (input: CustomerInput) => ({
  full_name: input.fullName.trim(),
  phone_number: input.phone.trim(),
  email: input.email.trim(),
  role: input.role,
  verified: input.verified,
  is_blocked: input.isBlocked,
});
