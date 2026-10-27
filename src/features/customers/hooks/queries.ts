import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { customersApi } from "../api/customers.api";
import { CUSTOMER_API } from "../model/capabilities";
import type {
  CustomerFilters,
  CustomerInput,
  CustomerListParams,
  CustomerProfilePatch,
  CustomerRole,
} from "../model/types";

/** Query-key root of the feature — one place that defines its cache structure. */
const ALL = ["customers-admin"] as const;

export function useCustomersQuery(params: CustomerListParams, enabled = true) {
  return useQuery({
    queryKey: [...ALL, "list", params],
    queryFn: () => customersApi.list(params),
    enabled,
    placeholderData: keepPreviousData,
  });
}

/** How many customers match the filters (a list request of one row: only its `total` is used). */
export function useCustomersCountQuery(filters: CustomerFilters, enabled = true) {
  return useQuery({
    queryKey: [...ALL, "count", filters],
    queryFn: async () => (await customersApi.list({ filters, page: 1, pageSize: 1 })).total,
    enabled,
    staleTime: 60_000,
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

export function useRoleHistoryQuery(id: number) {
  return useQuery({
    queryKey: [...ALL, "role-history", id],
    queryFn: () => customersApi.roleHistory(id),
  });
}

export function useCustomerNotesQuery(id: number) {
  return useQuery({
    queryKey: [...ALL, "notes", id],
    queryFn: () => customersApi.notes(id),
    enabled: CUSTOMER_API.notes,
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

export function usePatchCustomerProfile() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: ({ id, patch }: { id: number; patch: CustomerProfilePatch }) =>
      customersApi.patchProfile(id, patch),
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

export function useSetCustomerBlocked() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: ({ id, value }: { id: number; value: boolean }) =>
      customersApi.setBlocked(id, value),
    onSuccess: invalidate,
  });
}

export function useChangeCustomerRole() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: ({ id, role, reason }: { id: number; role: CustomerRole; reason: string }) =>
      customersApi.changeRole(id, role, reason),
    onSuccess: invalidate,
  });
}

export function useAddCustomerNote(id: number) {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (text: string) => customersApi.addNote(id, text),
    onSuccess: invalidate,
  });
}

export function useLogoutCustomerEverywhere() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (id: number) => customersApi.logoutAll(id),
    onSuccess: invalidate,
  });
}
