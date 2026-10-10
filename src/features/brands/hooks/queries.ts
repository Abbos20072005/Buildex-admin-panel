import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { brandsApi, type BrandsListParams } from "../api/brands.api";
import { brandKeys } from "../api/query-keys";
import type { Brand, BrandInput } from "../model/types";
import { useBulkMutation } from "@/shared/lib/useBulkMutation";

export function useBrandsListQuery(params: Omit<BrandsListParams, "lang">) {
  const lang = useTranslation().i18n.language;
  const full = { ...params, lang };
  return useQuery({
    queryKey: brandKeys.list(full),
    queryFn: () => brandsApi.list(full),
    // keep the current page on screen while the next one loads
    placeholderData: keepPreviousData,
  });
}

/** The brand filter of the products page reads brands too — refetch it after a change. */
function useInvalidateBrands() {
  const queryClient = useQueryClient();
  return () => {
    void queryClient.invalidateQueries({ queryKey: brandKeys.all });
    void queryClient.invalidateQueries({ queryKey: ["brands"] });
  };
}

export function useCreateBrand() {
  const invalidate = useInvalidateBrands();
  return useMutation({
    mutationFn: ({ input, image }: { input: BrandInput; image: File }) =>
      brandsApi.create(input, image),
    onSuccess: invalidate,
  });
}

export function useUpdateBrand() {
  const invalidate = useInvalidateBrands();
  return useMutation({
    mutationFn: ({ brand, input, image }: { brand: Brand; input: BrandInput; image?: File }) =>
      brandsApi.update(brand, input, image),
    onSuccess: invalidate,
  });
}

export function useSetBrandVisible() {
  const invalidate = useInvalidateBrands();
  return useMutation({
    mutationFn: ({ id, isVisible }: { id: number; isVisible: boolean }) =>
      brandsApi.setVisible(id, isVisible),
    onSuccess: invalidate,
  });
}

export function useDeleteBrand() {
  const invalidate = useInvalidateBrands();
  return useMutation({
    mutationFn: (id: number) => brandsApi.remove(id),
    onSuccess: invalidate,
  });
}

/** Sets the field of every selected row (one request per row). */
export function useBulkSetBrandVisible() {
  return useBulkMutation<boolean>((id, value) => brandsApi.setVisible(id, value), brandKeys.all);
}
