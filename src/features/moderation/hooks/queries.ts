import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { moderationApi } from "../api/moderation.api";
import type { ModerationListParams } from "../model/types";

const ALL = ["moderation"] as const;

export function useModerationStatsQuery() {
  return useQuery({
    queryKey: [...ALL, "stats"],
    queryFn: () => moderationApi.stats(),
    staleTime: 30_000,
  });
}

export function useModerationListQuery(params: ModerationListParams) {
  return useQuery({
    queryKey: [...ALL, "list", params],
    queryFn: () => moderationApi.list(params),
    placeholderData: keepPreviousData,
  });
}

export function useModerationDetailQuery(id: number | null) {
  return useQuery({
    queryKey: [...ALL, "detail", id],
    queryFn: () => moderationApi.get(id as number),
    enabled: id !== null,
  });
}

/** A review changes the queue, the counters and the product's publish status (sidebar, lists). */
function useRefresh() {
  const queryClient = useQueryClient();
  return () => {
    void queryClient.invalidateQueries({ queryKey: ALL });
    void queryClient.invalidateQueries({ queryKey: ["products"] });
  };
}

export function useApproveModeration() {
  const refresh = useRefresh();
  return useMutation({
    mutationFn: (id: number) => moderationApi.approve(id),
    // also on a failure: somebody else may have reviewed the row meanwhile
    onSettled: refresh,
  });
}

export function useRejectModeration() {
  const refresh = useRefresh();
  return useMutation({
    mutationFn: ({ id, reason }: { id: number; reason: string }) =>
      moderationApi.reject(id, reason),
    onSettled: refresh,
  });
}

export function useBulkApproveModeration() {
  const refresh = useRefresh();
  return useMutation({
    mutationFn: (ids: number[]) => moderationApi.bulkApprove(ids),
    onSettled: refresh,
  });
}
