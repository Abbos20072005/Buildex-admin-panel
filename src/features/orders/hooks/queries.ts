import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  orderCommentsApi,
  ordersApi,
  referencesApi,
  type OrdersListParams,
} from "../api/orders.api";
import { orderKeys, referenceKeys } from "../api/query-keys";
import type { OrderDetail, OrderFilters, OrderPatch, OrderStatus } from "../model/types";

export function useOrdersQuery(params: OrdersListParams) {
  return useQuery({
    queryKey: orderKeys.list(params),
    queryFn: () => ordersApi.list(params),
    // keep the current page on screen while the next one loads
    placeholderData: keepPreviousData,
  });
}

export function useOrderStatsQuery(filters: OrderFilters = {}) {
  return useQuery({
    queryKey: orderKeys.stats(filters),
    queryFn: () => ordersApi.stats(filters),
    placeholderData: keepPreviousData,
  });
}

export function useOrderQuery(id: number | null) {
  return useQuery({
    queryKey: orderKeys.detail(id ?? 0),
    queryFn: () => ordersApi.get(id as number),
    enabled: id !== null,
  });
}

export function useCustomerQuery(id: number | null | undefined) {
  return useQuery({
    queryKey: referenceKeys.customer(id ?? 0),
    queryFn: () => referencesApi.customer(id as number),
    enabled: !!id,
    staleTime: 5 * 60_000,
  });
}

export function useBranchesQuery() {
  return useQuery({
    queryKey: referenceKeys.branches,
    queryFn: referencesApi.branches,
    staleTime: 30 * 60_000,
  });
}

export function useManagersQuery() {
  return useQuery({
    queryKey: referenceKeys.managers,
    queryFn: referencesApi.managers,
    staleTime: 5 * 60_000,
  });
}

/** Adds an internal note and puts it on top of the opened order's notes. */
export function useAddOrderComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orderId, text }: { orderId: number; text: string }) =>
      orderCommentsApi.create(orderId, text),
    onSuccess: (comment, { orderId }) => {
      queryClient.setQueryData<OrderDetail>(orderKeys.detail(orderId), (order) =>
        order ? { ...order, comments: [comment, ...order.comments] } : order,
      );
    },
  });
}

/** Lists and counters depend on statuses — refetch them after any change. */
function useInvalidateOrderLists() {
  const queryClient = useQueryClient();
  return () => {
    void queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
    void queryClient.invalidateQueries({ queryKey: [...orderKeys.all, "stats"] });
  };
}

export function useUpdateOrder() {
  const queryClient = useQueryClient();
  const invalidateLists = useInvalidateOrderLists();

  return useMutation({
    mutationFn: ({ id, patch }: { id: number; patch: OrderPatch }) => ordersApi.update(id, patch),
    onSuccess: (order: OrderDetail) => {
      queryClient.setQueryData(orderKeys.detail(order.id), order);
      invalidateLists();
    },
  });
}

export interface BulkUpdateResult {
  succeeded: number;
  failed: number;
}

export function useBulkUpdateOrderStatus() {
  const invalidateLists = useInvalidateOrderLists();

  return useMutation({
    mutationFn: async ({
      ids,
      status,
    }: {
      ids: number[];
      status: OrderStatus;
    }): Promise<BulkUpdateResult> => {
      const results = await Promise.allSettled(ids.map((id) => ordersApi.update(id, { status })));
      const succeeded = results.filter((result) => result.status === "fulfilled").length;
      return { succeeded, failed: results.length - succeeded };
    },
    onSettled: invalidateLists,
  });
}
