import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { chatsApi } from "../api/chats.api";
import type { ChatListParams, ReplyInput } from "../model/types";

const ALL = ["chats"] as const;

/** There is no websocket: the panel asks again every few seconds while the tab is open. */
const LIST_POLL_MS = 15_000;
const THREAD_POLL_MS = 8_000;

export function useChatStatsQuery() {
  return useQuery({
    queryKey: [...ALL, "stats"],
    queryFn: () => chatsApi.stats(),
    refetchInterval: LIST_POLL_MS,
  });
}

export function useChatsQuery(params: ChatListParams) {
  return useQuery({
    queryKey: [...ALL, "list", params],
    queryFn: () => chatsApi.list(params),
    placeholderData: keepPreviousData,
    refetchInterval: LIST_POLL_MS,
  });
}

/** One chat by id: the opened chat may be on another page of the list, or filtered out of it. */
export function useChatQuery(id: number | null) {
  return useQuery({
    queryKey: [...ALL, "detail", id],
    queryFn: () => chatsApi.get(id as number),
    enabled: id !== null,
    refetchInterval: LIST_POLL_MS,
  });
}

export function useChatMessagesQuery(chatId: number | null) {
  return useQuery({
    queryKey: [...ALL, "messages", chatId],
    queryFn: () => chatsApi.messages(chatId as number),
    enabled: chatId !== null,
    refetchInterval: THREAD_POLL_MS,
  });
}

/** A new message changes the thread, the list order, the "unanswered" counters. */
function useRefresh() {
  const queryClient = useQueryClient();
  return () => void queryClient.invalidateQueries({ queryKey: ALL });
}

export function useReply() {
  const refresh = useRefresh();
  return useMutation({
    mutationFn: (input: ReplyInput) => chatsApi.reply(input),
    onSuccess: refresh,
  });
}

export function useEditMessage() {
  const refresh = useRefresh();
  return useMutation({
    mutationFn: ({ id, text }: { id: number; text: string }) => chatsApi.editMessage(id, text),
    onSuccess: refresh,
  });
}

export function useRemoveMessage() {
  const refresh = useRefresh();
  return useMutation({
    mutationFn: (id: number) => chatsApi.removeMessage(id),
    onSuccess: refresh,
  });
}

export function useCreateChat() {
  const refresh = useRefresh();
  return useMutation({
    mutationFn: (customerId: number) => chatsApi.create(customerId),
    onSuccess: refresh,
  });
}

export function useRemoveChat() {
  const refresh = useRefresh();
  return useMutation({
    mutationFn: (id: number) => chatsApi.remove(id),
    onSuccess: refresh,
  });
}
