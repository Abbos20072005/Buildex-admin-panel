import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { customersApi } from "../api/customers.api";
import type { CustomerInput, CustomerListParams } from "../model/types";

/** Query-key root of the feature — one place that defines its cache structure. */
const ALL = ["customers-admin"] as const;

export function useCustomersQuery(params: CustomerListParams) {
  return useQuery({
    queryKey: [...ALL, "list", params],
    queryFn: () => customersApi.list(params),
    placeholderData: keepPreviousData,
  });
}

export function useCustomerStatsQuery() {
  return useQuery({ queryKey: [...ALL, "stats"], queryFn: customersApi.stats });
}

export function useCustomerQuery(id: number | null) {
  return useQuery({
    queryKey: [...ALL, "detail", id],
    queryFn: () => customersApi.get(id as number),
    enabled: id !== null,
  });
}

function useInvalidate() {
  const queryClient = useQueryClient();
  return () => void queryClient.invalidateQueries({ queryKey: ALL });
}

export function useCreateCustomer() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (input: CustomerInput) => customersApi.create(input),
    onSuccess: invalidate,
  });
}

export function useUpdateCustomer() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: CustomerInput }) =>
      customersApi.update(id, input),
    onSuccess: invalidate,
  });
}

export function useDeleteCustomer() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (id: number) => customersApi.remove(id),
    onSuccess: invalidate,
  });
}
