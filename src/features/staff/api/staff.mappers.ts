import type { Query } from "@/shared/api";
import type {
  ResetPasswordResult,
  StaffCreateInput,
  StaffFilters,
  StaffInput,
  StaffMember,
} from "../model/types";
import type { ResetPasswordDto, StaffDto } from "./staff.dto";

export const mapStaff = (dto: StaffDto): StaffMember => ({
  id: dto.id,
  username: dto.username,
  fullName: dto.full_name,
  position: dto.position?.trim() ?? "",
  accessLevel: dto.access_level,
  mustChangePassword: !!dto.must_change_password,
  status: dto.status,
  blockReason: dto.block_reason ?? null,
  failedLoginAttempts: dto.failed_login_attempts ?? 0,
  lastLogin: dto.last_login ?? null,
  createdBy: dto.created_by
    ? {
        id: dto.created_by.id,
        username: dto.created_by.username,
        fullName: dto.created_by.full_name,
      }
    : null,
  createdAt: dto.created_at,
});

export const mapResetPassword = (dto: ResetPasswordDto): ResetPasswordResult => ({
  password: dto.password,
  mustChangePassword: dto.must_change_password,
});

export const filtersToQuery = (filters: StaffFilters): Query => ({
  search: filters.search?.trim() || undefined,
  access_level: filters.accessLevel,
  status: filters.status,
});

/** PATCH body: the login can't change, the password has its own action */
export const inputToDto = (input: StaffInput) => ({
  full_name: input.fullName.trim(),
  position: input.position.trim(),
  access_level: input.accessLevel,
  must_change_password: input.mustChangePassword,
});

export const createInputToDto = (input: StaffCreateInput) => ({
  ...inputToDto(input),
  username: input.username.trim().toLowerCase(),
  password: input.password,
});
