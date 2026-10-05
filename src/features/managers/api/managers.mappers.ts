import type { Query } from "@/shared/api";
import type { Manager, ManagerFilters, ManagerInput } from "../model/types";
import type { ManagerDto } from "./managers.dto";

export const mapManager = (dto: ManagerDto): Manager => ({
  id: dto.id,
  fullName: dto.full_name,
  isActive: dto.is_active ?? true,
  createdAt: dto.created_at,
});

export const filtersToQuery = (filters: ManagerFilters): Query => ({
  search: filters.search?.trim() || undefined,
  is_active: filters.isActive,
});

export const inputToDto = (input: ManagerInput) => ({
  full_name: input.fullName.trim(),
  is_active: input.isActive,
});
