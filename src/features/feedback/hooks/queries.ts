import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { feedbackApi } from "../api/feedback.api";
import type { FeedbackKind, FeedbackListParams } from "../model/types";

const all = (kind: FeedbackKind) => ["feedback", kind] as const;

/** There is no websocket: the panel asks again while the tab is open. */
const POLL_MS = 30_000;
export function useFeedbackStatsQuery(kind: FeedbackKind) {
  return useQuery({
    queryKey: [...all(kind), "stats"],
    queryFn: () => feedbackApi.stats(kind),
    refetchInterval: POLL_MS,
  });
}

/** One page of the table; the previous page stays on the screen while the next one loads. */
export function useFeedbackListQuery(kind: FeedbackKind, params: FeedbackListParams) {
  return useQuery({
    queryKey: [...all(kind), "list", params],
    queryFn: () => feedbackApi.list(kind, params),
    placeholderData: keepPreviousData,
    refetchInterval: POLL_MS,
  });
}

/** One item with its answers: the opened one may be on another page, or filtered out of the list. */
export function useFeedbackQuery(kind: FeedbackKind, id: number | null) {
  return useQuery({
    queryKey: [...all(kind), "detail", id],
    queryFn: () => feedbackApi.get(kind, id as number),
    enabled: id !== null,
    refetchInterval: POLL_MS,
  });
}

/** An answer, a hidden item, a deletion change the thread, the list and the counters. */
function useRefresh(kind: FeedbackKind) {
  const queryClient = useQueryClient();
  // returns the promise: a mutation waits for the reload before it counts as done
  return () => queryClient.invalidateQueries({ queryKey: all(kind) });
}

export function useReplyMutation(kind: FeedbackKind) {
  const refresh = useRefresh(kind);
  return useMutation({
    mutationFn: ({ itemId, text }: { itemId: number; text: string }) =>
      feedbackApi.reply(kind, itemId, text),
    onSuccess: refresh,
  });
}

export function useEditReplyMutation(kind: FeedbackKind) {
  const refresh = useRefresh(kind);
  return useMutation({
    mutationFn: ({ id, text }: { id: number; text: string }) =>
      feedbackApi.editReply(kind, id, text),
    onSuccess: refresh,
  });
}

export function useRemoveReplyMutation(kind: FeedbackKind) {
  const refresh = useRefresh(kind);
  return useMutation({
    mutationFn: (id: number) => feedbackApi.removeReply(kind, id),
    onSuccess: refresh,
  });
}

export function useSetVisibleMutation(kind: FeedbackKind) {
  const refresh = useRefresh(kind);
  return useMutation({
    mutationFn: ({ id, isVisible }: { id: number; isVisible: boolean }) =>
      feedbackApi.setVisible(kind, id, isVisible),
    onSuccess: refresh,
  });
}

export function useRemoveFeedbackMutation(kind: FeedbackKind) {
  const refresh = useRefresh(kind);
  return useMutation({
    mutationFn: (id: number) => feedbackApi.remove(kind, id),
    onSuccess: refresh,
  });
}
