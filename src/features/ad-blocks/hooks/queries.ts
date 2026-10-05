import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { adBlocksApi } from "../api/ad-blocks.api";
import type { AdBlockInput, AdBlockListParams } from "../model/types";

/** Query-key root of the feature — one place that defines its cache structure. */
const ALL = ["ad-blocks"] as const;

export function useAdBlocksQuery(params: AdBlockListParams) {
  return useQuery({
    queryKey: [...ALL, "list", params],
    queryFn: () => adBlocksApi.list(params),
    placeholderData: keepPreviousData,
  });
}

export function useAdBlockQuery(id: number | null) {
  return useQuery({
    queryKey: [...ALL, "detail", id],
    queryFn: () => adBlocksApi.get(id as number),
    enabled: id !== null,
  });
}

/** Search of the product picker; names come in the UI language. */
export function useProductSearchQuery(search: string) {
  const lang = useTranslation().i18n.language;
  return useQuery({
    queryKey: [...ALL, "products", lang, search],
    queryFn: () => adBlocksApi.searchProducts(search),
    staleTime: 60_000,
    placeholderData: keepPreviousData,
  });
}

export function useBrandSearchQuery(search: string) {
  const lang = useTranslation().i18n.language;
  return useQuery({
    queryKey: [...ALL, "brands", lang, search],
    queryFn: () => adBlocksApi.searchBrands(search),
    staleTime: 60_000,
    placeholderData: keepPreviousData,
  });
}

function useInvalidate() {
  const queryClient = useQueryClient();
  return () => void queryClient.invalidateQueries({ queryKey: ALL });
}

export function useCreateAdBlock() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (input: AdBlockInput) => adBlocksApi.create(input),
    onSuccess: invalidate,
  });
}

export function useUpdateAdBlock() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: AdBlockInput }) =>
      adBlocksApi.update(id, input),
    onSuccess: invalidate,
  });
}

export function useDeleteAdBlock() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (id: number) => adBlocksApi.remove(id),
    onSuccess: invalidate,
  });
}
