import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { pushApi } from "../api/push.api";
import type { PushInput, PushListParams } from "../model/types";

/** Query-key root of the feature — one place that defines its cache structure. */
const ALL = ["push"] as const;

export function usePushListQuery(params: PushListParams) {
  return useQuery({
    queryKey: [...ALL, "list", params],
    queryFn: () => pushApi.list(params),
    placeholderData: keepPreviousData,
  });
}

export function usePushStatsQuery() {
  return useQuery({ queryKey: [...ALL, "stats"], queryFn: pushApi.stats });
}

export function usePushQuery(id: number | null) {
  return useQuery({
    queryKey: [...ALL, "detail", id],
    queryFn: () => pushApi.get(id as number),
    enabled: id !== null,
  });
}

function useInvalidate() {
  const queryClient = useQueryClient();
  return () => void queryClient.invalidateQueries({ queryKey: ALL });
}

export function useCreatePush() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (input: PushInput) => pushApi.create(input),
    onSuccess: invalidate,
  });
}

export function useUpdatePush() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: PushInput }) => pushApi.update(id, input),
    onSuccess: invalidate,
  });
}

export function useDeletePush() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (id: number) => pushApi.remove(id),
    onSuccess: invalidate,
  });
}
