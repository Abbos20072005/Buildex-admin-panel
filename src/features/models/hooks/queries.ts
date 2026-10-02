import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { modelsApi, type ModelsListParams } from "../api/models.api";
import { modelKeys } from "../api/query-keys";
import type { ProductModelInput } from "../model/types";

type ValidInput = ProductModelInput & { brandId: number };

export function useModelsListQuery(params: ModelsListParams) {
  return useQuery({
    queryKey: modelKeys.list(params),
    queryFn: () => modelsApi.list(params),
    placeholderData: keepPreviousData,
  });
}

/** Brand counters and the product forms read models too — refetch them after a change. */
function useInvalidateModels() {
  const queryClient = useQueryClient();
  return () => {
    void queryClient.invalidateQueries({ queryKey: modelKeys.all });
    void queryClient.invalidateQueries({ queryKey: ["product-models"] });
    void queryClient.invalidateQueries({ queryKey: ["products"] });
  };
}

export function useCreateModel() {
  const invalidate = useInvalidateModels();
  return useMutation({
    mutationFn: (input: ValidInput) => modelsApi.create(input),
    onSuccess: invalidate,
  });
}

export function useUpdateModel() {
  const invalidate = useInvalidateModels();
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: ValidInput }) => modelsApi.update(id, input),
    onSuccess: invalidate,
  });
}

export function useDeleteModel() {
  const invalidate = useInvalidateModels();
  return useMutation({
    mutationFn: (id: number) => modelsApi.remove(id),
    onSuccess: invalidate,
  });
}
