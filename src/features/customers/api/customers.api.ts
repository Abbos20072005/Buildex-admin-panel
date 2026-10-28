import { api, type Page, type Paginated } from "@/shared/api";
import type {
  Customer,
  CustomerActivity,
  CustomerInput,
  CustomerListParams,
  CustomerNote,
  CustomerProfilePatch,
  CustomerRole,
  CustomerStats,
  RoleHistoryEntry,
} from "../model/types";
import type {
  CustomerActivityDto,
  CustomerDto,
  CustomerNoteDto,
  CustomerStatsDto,
  RevealedPhoneDto,
  RoleHistoryDto,
} from "./customers.dto";
import {
  filtersToQuery,
  inputToDto,
  mapActivity,
  mapCustomer,
  mapNote,
  mapRoleHistory,
  mapStats,
  profilePatchToDto,
} from "./customers.mappers";

export const customersApi = {
  /** GET /admin/customers/ — newest first; filters and search are applied by the server */
  async list({ filters, page, pageSize }: CustomerListParams): Promise<Page<Customer>> {
    const data = await api.get<Paginated<CustomerDto>>("/customers/", {
      ...filtersToQuery(filters),
      page,
      page_size: pageSize,
      ordering: "-created_at",
    });
    return { total: data.count ?? data.results.length, items: data.results.map(mapCustomer) };
  },

  /** GET /admin/customers/stats/ — cards (not affected by the list filters) */
  async stats(): Promise<CustomerStats> {
    return mapStats(await api.get<CustomerStatsDto>("/customers/stats/"));
  },

  /** GET /admin/customers/{id}/ — with the addresses */
  async get(id: number): Promise<Customer> {
    return mapCustomer(await api.get<CustomerDto>(`/customers/${id}/`));
  },

  /** POST /admin/customers/ */
  async create(input: CustomerInput): Promise<Customer> {
    return mapCustomer(await api.post<CustomerDto>("/customers/", inputToDto(input)));
  },

  /** PATCH /admin/customers/{id}/ */
  async update(id: number, input: CustomerInput): Promise<Customer> {
    return mapCustomer(await api.patch<CustomerDto>(`/customers/${id}/`, inputToDto(input, true)));
  },

  /** PATCH /admin/customers/{id}/ — only the fields of the profile card */
  async patchProfile(id: number, patch: CustomerProfilePatch): Promise<Customer> {
    return mapCustomer(await api.patch<CustomerDto>(`/customers/${id}/`, profilePatchToDto(patch)));
  },

  /** DELETE /admin/customers/{id}/ */
  async remove(id: number): Promise<void> {
    await api.delete(`/customers/${id}/`);
  },

  /** PATCH /customers/{id}/ { is_blocked } — one field, used by the block button */
  async setBlocked(id: number, value: boolean): Promise<void> {
    await api.patch(`/customers/${id}/`, { is_blocked: value });
  },

  /** POST /admin/customers/{id}/role/ — `reason` is required when PRO is revoked */
  async changeRole(id: number, role: CustomerRole, reason: string): Promise<void> {
    await api.post(`/customers/${id}/role/`, { role, reason });
  },

  /** GET /admin/customers/{id}/role-history/ — newest first */
  async roleHistory(id: number): Promise<RoleHistoryEntry[]> {
    const data = await api.get<RoleHistoryDto[] | Paginated<RoleHistoryDto>>(
      `/customers/${id}/role-history/`,
    );
    return (Array.isArray(data) ? data : data.results).map(mapRoleHistory);
  },

  /** GET /admin/customers/{id}/notes/ — newest first */
  async notes(id: number): Promise<CustomerNote[]> {
    const data = await api.get<Paginated<CustomerNoteDto>>(`/customers/${id}/notes/`, {
      page_size: 100,
    });
    return data.results.map(mapNote);
  },

  /** POST /admin/customers/{id}/notes/ — an empty text is a 400 */
  async addNote(id: number, text: string): Promise<CustomerNote> {
    return mapNote(await api.post<CustomerNoteDto>(`/customers/${id}/notes/`, { text }));
  },

  /** DELETE /admin/customers/{id}/notes/{noteId}/ — only the author or a super admin (else 403) */
  async removeNote(id: number, noteId: number): Promise<void> {
    await api.delete(`/customers/${id}/notes/${noteId}/`);
  },

  /** GET /admin/customers/{id}/activity/ — the journal, newest first (it starts at the deploy) */
  async activity(id: number): Promise<CustomerActivity[]> {
    const data = await api.get<Paginated<CustomerActivityDto>>(`/customers/${id}/activity/`, {
      page_size: 100,
    });
    return data.results.map(mapActivity);
  },

  /** POST /admin/customers/{id}/reveal-phone/ — the whole number; every call is written to the journal */
  async revealPhone(id: number): Promise<string> {
    return (await api.post<RevealedPhoneDto>(`/customers/${id}/reveal-phone/`)).phone_number;
  },

  /** POST /admin/customers/{id}/logout-all/ — all tokens stop working, the push tokens are removed */
  async logoutAll(id: number): Promise<void> {
    await api.post(`/customers/${id}/logout-all/`);
  },
};
