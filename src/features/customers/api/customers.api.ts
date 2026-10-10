import { api, type Page, type Paginated } from "@/shared/api";
import type { Customer, CustomerInput, CustomerListParams, CustomerStats } from "../model/types";
import type { CustomerDto, CustomerStatsDto } from "./customers.dto";
import { filtersToQuery, inputToDto, mapCustomer, mapStats } from "./customers.mappers";

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
    return mapCustomer(await api.patch<CustomerDto>(`/customers/${id}/`, inputToDto(input)));
  },

  /** DELETE /admin/customers/{id}/ */
  async remove(id: number): Promise<void> {
    await api.delete(`/customers/${id}/`);
  },
  /** PATCH /customers/{id}/ { is_blocked } — one field, used by the bulk status change */
  async setBlocked(id: number, value: boolean): Promise<void> {
    await api.patch(`/customers/${id}/`, { is_blocked: value });
  },
};
