import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { partnerBrandsApi, type PartnerBrandsListParams } from "../api/partner-brands.api";
import { partnerBrandKeys } from "../api/query-keys";
import type { PartnerBrandInput } from "../model/types";

export function usePartnerBrandsQuery(params: PartnerBrandsListParams) {
  return useQuery({
    queryKey: partnerBrandKeys.list(params),
    queryFn: () => partnerBrandsApi.list(params),
    placeholderData: keepPreviousData,
  });
}

function useInvalidate() {
  const queryClient = useQueryClient();
  return () => void queryClient.invalidateQueries({ queryKey: partnerBrandKeys.all });
}

export function useCreatePartnerBrand() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (input: PartnerBrandInput) => partnerBrandsApi.create(input),
    onSuccess: invalidate,
  });
}

export function useUpdatePartnerBrand() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: PartnerBrandInput }) =>
      partnerBrandsApi.update(id, input),
    onSuccess: invalidate,
  });
}

export function useDeletePartnerBrand() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (id: number) => partnerBrandsApi.remove(id),
    onSuccess: invalidate,
  });
}
