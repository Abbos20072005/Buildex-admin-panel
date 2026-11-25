import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { faqApi } from "../api/faq.api";
import type { FaqItemInput, FaqItemListParams } from "../model/types";

/** Query-key root of the feature. */
const ALL = ["faq"] as const;

export function useFaqItemsQuery(params: FaqItemListParams) {
  return useQuery({
    queryKey: [...ALL, "items", params],
    queryFn: () => faqApi.listItems(params),
    placeholderData: keepPreviousData,
  });
}

function useInvalidate() {
  const queryClient = useQueryClient();
  return () => void queryClient.invalidateQueries({ queryKey: ALL });
}

export function useCreateFaqItem() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (input: FaqItemInput) => faqApi.createItem(input),
    onSuccess: invalidate,
  });
}

export function useUpdateFaqItem() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: FaqItemInput }) =>
      faqApi.updateItem(id, input),
    onSuccess: invalidate,
  });
}

export function useSetFaqItemActive() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: ({ id, isActive }: { id: number; isActive: boolean }) =>
      faqApi.setItemActive(id, isActive),
    onSuccess: invalidate,
  });
}

export function useDeleteFaqItem() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (id: number) => faqApi.removeItem(id),
    onSuccess: invalidate,
  });
}

export function useReorderFaqItems() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (ids: number[]) => faqApi.reorderItems(ids),
    onSettled: invalidate,
  });
}
