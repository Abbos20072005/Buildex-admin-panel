import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { managersApi } from "../api/managers.api";
import type { ManagerInput, ManagerListParams } from "../model/types";

/** Query-key root of this feature's lists. */
const ALL = ["managers-admin"] as const;

/** Key of the "Menejer" dropdown of an order — it must follow every change made here. */
const ORDER_DROPDOWN = ["managers"] as const;

export function useManagersQuery(params: ManagerListParams) {
  return useQuery({
    queryKey: [...ALL, "list", params],
    queryFn: () => managersApi.list(params),
    placeholderData: keepPreviousData,
  });
}

function useInvalidate() {
  const queryClient = useQueryClient();
  return () => {
    void queryClient.invalidateQueries({ queryKey: ALL });
    void queryClient.invalidateQueries({ queryKey: ORDER_DROPDOWN });
  };
}

export function useCreateManager() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (input: ManagerInput) => managersApi.create(input),
    onSuccess: invalidate,
  });
}

export function useUpdateManager() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: ManagerInput }) =>
      managersApi.update(id, input),
    onSuccess: invalidate,
  });
}

export function useDeleteManager() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (id: number) => managersApi.remove(id),
    onSuccess: invalidate,
  });
}
