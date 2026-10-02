import { api, type Page, type Paginated } from "@/shared/api";
import type {
  Branch,
  CustomerInfo,
  Manager,
  Order,
  OrderComment,
  OrderDetail,
  OrderFilters,
  OrderPatch,
  OrderSort,
  OrderStats,
} from "../model/types";
import type {
  BranchDto,
  CustomerDto,
  ManagerDto,
  OrderCommentDto,
  OrderDto,
  OrderListDto,
  OrderStatsDto,
} from "./orders.dto";
import {
  filtersToQuery,
  mapComment,
  mapCustomer,
  mapManager,
  mapOrder,
  mapOrderDetail,
  mapOrderStats,
  patchToDto,
} from "./orders.mappers";

export interface OrdersListParams {
  filters: OrderFilters;
  page: number;
  pageSize: number;
  sort?: OrderSort;
}

export const ordersApi = {
  /** GET /admin/orders/ — server-side filtering, search and pagination */
  async list({
    filters,
    page,
    pageSize,
    sort = "-created_at",
  }: OrdersListParams): Promise<Page<Order>> {
    const data = await api.get<Paginated<OrderListDto>>("/orders/", {
      ...filtersToQuery(filters),
      page,
      page_size: pageSize,
      ordering: sort,
    });
    return { total: data.count ?? data.results.length, items: data.results.map(mapOrder) };
  },

  /** GET /admin/orders/stats/ — the status filter is dropped so every tab gets its own counter */
  async stats(filters: OrderFilters = {}): Promise<OrderStats> {
    const data = await api.get<OrderStatsDto>(
      "/orders/stats/",
      filtersToQuery({ ...filters, status: undefined }),
    );
    return mapOrderStats(data);
  },

  /** GET /admin/orders/{id}/ */
  async get(id: number): Promise<OrderDetail> {
    return mapOrderDetail(await api.get<OrderDto>(`/orders/${id}/`));
  },

  /** PATCH /admin/orders/{id}/ */
  async update(id: number, patch: OrderPatch): Promise<OrderDetail> {
    return mapOrderDetail(await api.patch<OrderDto>(`/orders/${id}/`, patchToDto(patch)));
  },

  /** Every order matching the filters, page by page (CSV export). */
  async listAll(
    filters: OrderFilters,
    onProgress?: (loaded: number, total: number) => void,
  ): Promise<Order[]> {
    const pageSize = 100;
    const all: Order[] = [];
    for (let page = 1; page <= 500; page++) {
      const { items, total } = await ordersApi.list({ filters, page, pageSize });
      all.push(...items);
      onProgress?.(all.length, total);
      if (all.length >= total || items.length < pageSize) break;
    }
    return all;
  },
};

export const orderCommentsApi = {
  /** POST /admin/order-comments/ — the author comes from the token */
  async create(orderId: number, text: string): Promise<OrderComment> {
    return mapComment(
      await api.post<OrderCommentDto>("/order-comments/", { order: orderId, text }),
    );
  },
};

export const referencesApi = {
  /** GET /admin/managers/?is_active=true — options of the "Menejer" dropdown */
  async managers(): Promise<Manager[]> {
    const data = await api.get<Paginated<ManagerDto>>("/managers/", {
      is_active: true,
      page_size: 100,
    });
    return data.results.map(mapManager);
  },

  /** GET /admin/customers/{id}/ */
  async customer(id: number): Promise<CustomerInfo> {
    return mapCustomer(await api.get<CustomerDto>(`/customers/${id}/`));
  },

  /** GET /admin/branches/ */
  async branches(): Promise<Branch[]> {
    const data = await api.get<Paginated<BranchDto>>("/branches/", { page_size: 100 });
    return data.results.map(({ id, name }) => ({ id, name }));
  },
};
