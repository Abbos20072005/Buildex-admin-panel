import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useBulkMutation } from "@/shared/lib/useBulkMutation";
import { salesApi } from "../api/sales.api";
import type { SaleFiles, SaleInput, SaleListParams } from "../model/types";

const ALL = ["sales"] as const;

export function useSalesQuery(params: SaleListParams) {
  return useQuery({
    queryKey: [...ALL, "list", params],
    queryFn: () => salesApi.list(params),
    placeholderData: keepPreviousData,
  });
}

export function useSaleQuery(id: number | null) {
  return useQuery({
    queryKey: [...ALL, "detail", id],
    queryFn: () => salesApi.get(id as number),
    enabled: id !== null,
  });
}

function useInvalidate() {
  const queryClient = useQueryClient();
  return () => void queryClient.invalidateQueries({ queryKey: ALL });
}

export function useCreateSale() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: ({ input, files }: { input: SaleInput; files: SaleFiles }) =>
      salesApi.create(input, files),
    onSuccess: invalidate,
  });
}

export function useUpdateSale() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: ({ id, input, files }: { id: number; input: SaleInput; files: SaleFiles }) =>
      salesApi.update(id, input, files),
    onSuccess: invalidate,
  });
}

export function useDeleteSale() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (id: number) => salesApi.remove(id),
    onSuccess: invalidate,
  });
}

/** Shows (true) or hides (false) every selected sale. */
export function useBulkSetSaleVisible() {
  return useBulkMutation<boolean>((id, value) => salesApi.setVisible(id, value), ALL);
}
