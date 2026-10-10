import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { attributesApi, type AttributesListParams } from "../api/attributes.api";
import { attributeKeys } from "../api/query-keys";
import type { AttributeInput } from "../model/types";
import { useBulkMutation } from "@/shared/lib/useBulkMutation";

export function useAttributesListQuery(params: Omit<AttributesListParams, "lang">) {
  const lang = useTranslation().i18n.language;
  const full = { ...params, lang };
  return useQuery({
    queryKey: attributeKeys.list(full),
    queryFn: () => attributesApi.list(full),
    // keep the current page on screen while the next one loads
    placeholderData: keepPreviousData,
  });
}

/** The product page and the category lists read attributes too — refetch them after a change. */
function useInvalidateAttributes() {
  const queryClient = useQueryClient();
  return () => {
    void queryClient.invalidateQueries({ queryKey: attributeKeys.all });
    void queryClient.invalidateQueries({ queryKey: ["attributes"] });
  };
}

export function useCreateAttribute() {
  const invalidate = useInvalidateAttributes();
  return useMutation({
    mutationFn: (input: AttributeInput) => attributesApi.create(input),
    onSuccess: invalidate,
  });
}

export function useUpdateAttribute() {
  const invalidate = useInvalidateAttributes();
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: AttributeInput }) =>
      attributesApi.update(id, input),
    onSuccess: invalidate,
  });
}

export function useDeleteAttribute() {
  const invalidate = useInvalidateAttributes();
  return useMutation({
    mutationFn: (id: number) => attributesApi.remove(id),
    onSuccess: invalidate,
  });
}

/** Sets the field of every selected row (one request per row). */
export function useBulkSetAttributeActive() {
  return useBulkMutation<boolean>(
    (id, value) => attributesApi.setActive(id, value),
    attributeKeys.all,
  );
}
