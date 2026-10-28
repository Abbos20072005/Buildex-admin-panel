import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Page } from "@/shared/api";
import { useBulkMutation } from "@/shared/lib/useBulkMutation";
import { storesApi } from "../api/stores.api";
import type { Store, StoreFiles, StoreInput, StoreListParams } from "../model/types";

const ALL = ["stores"] as const;

export function useStoresQuery(params: StoreListParams) {
  return useQuery({
    queryKey: [...ALL, "list", params],
    queryFn: () => storesApi.list(params),
    placeholderData: keepPreviousData,
  });
}

function useInvalidate() {
  const queryClient = useQueryClient();
  return () => void queryClient.invalidateQueries({ queryKey: ALL });
}

export function useCreateStore() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: ({ input, files }: { input: StoreInput; files: StoreFiles }) =>
      storesApi.create(input, files),
    onSuccess: invalidate,
  });
}

export function useUpdateStore() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: ({ id, input, files }: { id: number; input: StoreInput; files: StoreFiles }) =>
      storesApi.update(id, input, files),
    onSuccess: invalidate,
  });
}

export function useDeleteStore() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (id: number) => storesApi.remove(id),
    onSuccess: invalidate,
  });
}

/** "Faollashtirish" / "Nofaol qilish" of one store. */
export function useSetStoreActive() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: ({ id, value }: { id: number; value: boolean }) => storesApi.setActive(id, value),
    onSuccess: invalidate,
  });
}

/** Sets the field of every selected row (one request per row). */
export function useBulkSetStoreActive() {
  return useBulkMutation<boolean>((id, value) => storesApi.setActive(id, value), ALL);
}

/** Drag & drop: the list is reordered on screen at once and put back if the server refuses. */
export function useReorderStores() {
  const queryClient = useQueryClient();
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (ids: number[]) => storesApi.reorder(ids),
    onMutate: async (ids) => {
      await queryClient.cancelQueries({ queryKey: ALL });
      const previous = queryClient.getQueriesData<Page<Store>>({ queryKey: ALL });
      const order = new Map(ids.map((id, index) => [id, index]));
      queryClient.setQueriesData<Page<Store>>({ queryKey: [...ALL, "list"] }, (page) =>
        page
          ? {
              ...page,
              items: [...page.items].sort(
                (a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0),
              ),
            }
          : page,
      );
      return { previous };
    },
    onError: (_error, _ids, context) => {
      context?.previous.forEach(([key, data]) => queryClient.setQueryData(key, data));
    },
    onSettled: invalidate,
  });
}
