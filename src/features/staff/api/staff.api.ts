import { api, type Page, type Paginated } from "@/shared/api";
import type {
  ResetPasswordResult,
  StaffCreateInput,
  StaffInput,
  StaffListParams,
  StaffMember,
} from "../model/types";
import type { ResetPasswordDto, StaffDto } from "./staff.dto";
import {
  createInputToDto,
  filtersToQuery,
  inputToDto,
  mapResetPassword,
  mapStaff,
} from "./staff.mappers";

export const staffApi = {
  /** GET /admin/staff/ (Super admin only) */
  async list({ filters, page, pageSize }: StaffListParams): Promise<Page<StaffMember>> {
    const data = await api.get<Paginated<StaffDto>>("/staff/", {
      ...filtersToQuery(filters),
      page,
      page_size: pageSize,
    });
    return { total: data.count ?? data.results.length, items: data.results.map(mapStaff) };
  },

  /** POST /admin/staff/ */
  async create(input: StaffCreateInput): Promise<StaffMember> {
    return mapStaff(await api.post<StaffDto>("/staff/", createInputToDto(input)));
  },

  /** PATCH /admin/staff/{id}/ */
  async update(id: number, input: StaffInput): Promise<StaffMember> {
    return mapStaff(await api.patch<StaffDto>(`/staff/${id}/`, inputToDto(input)));
  },

  /** DELETE /admin/staff/{id}/ — blocking is usually the better choice */
  async remove(id: number): Promise<void> {
    await api.delete(`/staff/${id}/`);
  },

  /** POST /admin/staff/{id}/reset-password/ — without a body the backend makes a 12-character password */
  async resetPassword(id: number): Promise<ResetPasswordResult> {
    return mapResetPassword(
      await api.post<ResetPasswordDto>(`/staff/${id}/reset-password/`, {
        must_change_password: true,
      }),
    );
  },

  /** POST /admin/staff/{id}/block/ */
  async block(id: number): Promise<StaffMember> {
    return mapStaff(await api.post<StaffDto>(`/staff/${id}/block/`));
  },

  /** POST /admin/staff/{id}/unblock/ */
  async unblock(id: number): Promise<StaffMember> {
    return mapStaff(await api.post<StaffDto>(`/staff/${id}/unblock/`));
  },
};
