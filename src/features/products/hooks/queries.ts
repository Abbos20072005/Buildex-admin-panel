import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useBulkMutation } from "@/shared/lib/useBulkMutation";
import { productReferencesApi, productsApi, type ProductsListParams } from "../api/products.api";
import { productKeys, productReferenceKeys } from "../api/query-keys";
import { type ProductTab } from "../model/constants";
import type { ProductDetail, ProductFilters, ProductPatch, PublishStatus } from "../model/types";

/** current UI language — translated names depend on it */
export function useLang() {
  return useTranslation().i18n.language;
}

export function useProductsQuery(params: Omit<ProductsListParams, "lang">) {
  const lang = useLang();
  const full = { ...params, lang };
  return useQuery({
    queryKey: productKeys.list(full),
    queryFn: () => productsApi.list(full),
    // keep the current page on screen while the next one loads
    placeholderData: keepPreviousData,
  });
}

/**
 * Counter of every tab. GET /products/stats/ counts over the same filters as the list, so
 * one call per publish status gives all numbers: the "sold out" tab is the `out_of_stock`
 * of published products, "inactive" is the `inactive` of the whole list.
 */
export function useProductTabCountsQuery(filters: ProductFilters) {
  return useQuery({
    queryKey: productKeys.tabCounts(filters),
    queryFn: async (): Promise<Record<ProductTab, number>> => {
      const [all, published, draft, review] = await Promise.all([
        productsApi.stats(filters),
        productsApi.stats({ ...filters, publishStatus: "published" }),
        productsApi.stats({ ...filters, publishStatus: "draft" }),
        productsApi.stats({ ...filters, publishStatus: "review" }),
      ]);
      return {
        all: all.total,
        published: published.total,
        draft: draft.total,
        review: review.total,
        soldOut: published.outOfStock,
        inactive: all.inactive,
      };
    },
    placeholderData: keepPreviousData,
  });
}

/** Products waiting for moderation — the counter in the sidebar. */
export function useProductsInReviewCount() {
  return useQuery({
    queryKey: productKeys.inReview(),
    queryFn: async () => (await productsApi.stats({ publishStatus: "review" })).total,
    staleTime: 60_000,
  });
}

/** Total number of products — the counter in the sidebar. */
export function useProductsTotalCount() {
  return useQuery({
    queryKey: productKeys.total(),
    queryFn: async () => (await productsApi.stats()).total,
    staleTime: 60_000,
  });
}

export function useProductQuery(id: number | null) {
  const lang = useLang();
  return useQuery({
    queryKey: productKeys.detail(id ?? 0, lang),
    queryFn: () => productsApi.get(id as number),
    enabled: id !== null,
    placeholderData: keepPreviousData,
  });
}

/* ---------- dictionaries ---------- */

const LONG = 30 * 60_000;

export function useCategoriesQuery() {
  const lang = useLang();
  return useQuery({
    queryKey: productReferenceKeys.categories(lang),
    queryFn: productReferencesApi.categories,
    staleTime: LONG,
  });
}

export function useBrandsQuery(search: string) {
  const lang = useLang();
  return useQuery({
    queryKey: productReferenceKeys.brands(lang, search),
    queryFn: () => productReferencesApi.brands(search),
    staleTime: LONG,
    placeholderData: keepPreviousData,
  });
}

export function useBadgesQuery() {
  const lang = useLang();
  return useQuery({
    queryKey: productReferenceKeys.badges(lang),
    queryFn: productReferencesApi.badges,
    staleTime: LONG,
  });
}

export function useItemCategoriesQuery(search: string) {
  const lang = useLang();
  return useQuery({
    queryKey: productReferenceKeys.itemCategories(lang, search),
    queryFn: () => productReferencesApi.itemCategories(search),
    staleTime: LONG,
    placeholderData: keepPreviousData,
  });
}

/** Attributes (xususiyatlar) attached to the product's item category. */
export function useAttributesQuery(itemCategoryId: number | null | undefined) {
  const lang = useLang();
  return useQuery({
    queryKey: productReferenceKeys.attributes(lang, itemCategoryId ?? 0),
    queryFn: () => productReferencesApi.attributes(itemCategoryId as number),
    enabled: !!itemCategoryId,
    staleTime: LONG,
  });
}

/* ---------- mutations ---------- */

/** Lists and counters may change after any edit — refetch them, and the opened product. */
function useInvalidateProducts() {
  const queryClient = useQueryClient();
  return (id?: number) => {
    void queryClient.invalidateQueries({ queryKey: productKeys.lists() });
    void queryClient.invalidateQueries({ queryKey: productKeys.stats() });
    if (id !== undefined)
      void queryClient.invalidateQueries({ queryKey: [...productKeys.details(), id] });
  };
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();
  const lang = useLang();
  const invalidate = useInvalidateProducts();

  return useMutation({
    mutationFn: ({ id, patch }: { id: number; patch: ProductPatch }) =>
      productsApi.update(id, patch),
    onSuccess: (product: ProductDetail) => {
      queryClient.setQueryData(productKeys.detail(product.id, lang), product);
      // other languages of this product are cached separately — refresh them too
      invalidate(product.id);
    },
  });
}

/**
 * Moves every selected product to a publish status (draft / review / published): one request per
 * product; a product that isn't ready to publish fails on its own and is counted.
 */
export function useBulkSetPublishStatus() {
  return useBulkMutation<PublishStatus>(
    (id, publishStatus) => productsApi.update(id, { publishStatus }),
    productKeys.all,
  );
}

export function useUploadProductImage() {
  const invalidate = useInvalidateProducts();
  return useMutation({
    mutationFn: ({ id, file }: { id: number; file: File }) => productsApi.uploadImage(id, file),
    onSuccess: (_image, { id }) => invalidate(id),
  });
}

/** The photos are reordered on screen at once, then confirmed (or rolled back) by the server. */
export function useReorderProductImages() {
  const queryClient = useQueryClient();
  const invalidate = useInvalidateProducts();

  return useMutation({
    mutationFn: ({ id, ids }: { id: number; ids: number[] }) => productsApi.reorderImages(id, ids),
    onMutate: async ({ id, ids }) => {
      const key = [...productKeys.details(), id];
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueriesData<ProductDetail>({ queryKey: key });
      const order = new Map(ids.map((imageId, index) => [imageId, index]));
      queryClient.setQueriesData<ProductDetail>({ queryKey: key }, (product) =>
        product
          ? {
              ...product,
              images: [...product.images].sort(
                (a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0),
              ),
            }
          : product,
      );
      return { previous };
    },
    onError: (_error, _input, context) => {
      context?.previous.forEach(([key, data]) => queryClient.setQueryData(key, data));
    },
    onSettled: (_data, _error, { id }) => invalidate(id),
  });
}

export function useDeleteProductImage() {
  const invalidate = useInvalidateProducts();
  return useMutation({
    mutationFn: ({ id, imageId }: { id: number; imageId: number }) =>
      productsApi.deleteImage(id, imageId),
    onSuccess: (_result, { id }) => invalidate(id),
  });
}
