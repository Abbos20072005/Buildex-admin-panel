import type { Query } from "@/shared/api";
import { CUSTOMER_API } from "../model/capabilities";
import {
  CUSTOMER_SEGMENTS,
  type Customer,
  type CustomerChannel,
  type CustomerFilters,
  type CustomerInput,
  type CustomerNote,
  type CustomerProfilePatch,
  type CustomerSegment,
  type CustomerStats,
  type RoleHistoryEntry,
} from "../model/types";
import type {
  CustomerDto,
  CustomerNoteDto,
  CustomerStatsDto,
  RoleHistoryDto,
} from "./customers.dto";

const channelOf = (value: string | null | undefined): CustomerChannel | null =>
  !value ? null : value === "site" ? "site" : "app";

const segmentOf = (value: string | null | undefined): CustomerSegment | null =>
  CUSTOMER_SEGMENTS.find((segment) => segment === value) ?? null;

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
    apartment: address.apartment ?? "",
    entrance: address.entrance ?? "",
    floor: address.floor ?? "",
    intercom: address.intercom ?? "",
    courierComment: address.courier_comment ?? "",
  })),
  isDeleted: dto.is_deleted ?? false,
  segment: segmentOf(dto.segment),
  tags: dto.tags ?? [],
  channel: channelOf(dto.registration_channel),
  lastOrderAt: dto.last_order_at ?? null,
  returnsCount: dto.returns_count ?? null,
  language: dto.language ?? null,
  lastLoginPlatform: dto.last_login_platform ?? null,
  activeDevices: dto.active_devices ?? null,
  consents: Object.fromEntries(
    Object.entries(dto.consents ?? {}).map(([key, value]) => [
      key,
      { enabled: value.enabled, changedAt: value.changed_at ?? null },
    ]),
  ),
});

export const mapStats = (dto: CustomerStatsDto): CustomerStats => ({
  total: dto.total,
  active: dto.active,
  b2b: dto.b2b,
  blocked: dto.blocked,
  ordered30d: dto.ordered_30d,
  deleted: dto.deleted,
});

export const mapRoleHistory = (dto: RoleHistoryDto): RoleHistoryEntry => ({
  id: dto.id,
  oldRole: dto.old_value,
  newRole: dto.new_value,
  changedBy: dto.changed_by?.full_name?.trim() || dto.changed_by?.username || "—",
  reason: dto.reason ?? "",
  createdAt: dto.created_at,
});

export const mapNote = (dto: CustomerNoteDto): CustomerNote => {
  const author = dto.author;
  return {
    id: dto.id,
    author:
      typeof author === "string" ? author : author?.full_name?.trim() || author?.username || "—",
    text: dto.text,
    createdAt: dto.created_at,
  };
};

/**
 * Filters the API understands today go out always; the other ones only when the backend has them
 * (CUSTOMER_API) — an unknown parameter is ignored by the server and would show wrong rows.
 */
export const filtersToQuery = (filters: CustomerFilters): Query => ({
  search: filters.search?.trim() || undefined,
  role: filters.role,
  verified: filters.verified,
  is_blocked: filters.isBlocked,
  is_active: filters.isActive,
  has_orders: filters.hasOrders,
  from_created: filters.from,
  to_created: filters.to,
  ...(CUSTOMER_API.deletedCustomers ? { is_deleted: filters.isDeleted } : {}),
  ...(CUSTOMER_API.segments ? { segment: filters.segment } : {}),
  ...(CUSTOMER_API.registrationChannel
    ? { registration_channel: filters.channel === "app" ? ["ios", "android"] : filters.channel }
    : {}),
  ...(CUSTOMER_API.rangeFilters
    ? {
        orders_min: filters.ordersMin,
        orders_max: filters.ordersMax,
        purchase_min: filters.purchaseMin,
        purchase_max: filters.purchaseMax,
        last_order_from: filters.lastOrderFrom,
        last_order_to: filters.lastOrderTo,
      }
    : {}),
  ...(CUSTOMER_API.returns ? { has_returns: filters.hasReturns } : {}),
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

export const profilePatchToDto = (patch: CustomerProfilePatch) => ({
  full_name: patch.fullName?.trim(),
  ...(CUSTOMER_API.segments ? { segment: patch.segment, tags: patch.tags } : {}),
});
