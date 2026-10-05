import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { articlesApi, newsApi, videosApi, type ResourceApi } from "../api/publications.api";
import type { PublicationKind, PublicationListParams } from "../model/types";

/** React Query hooks of one resource; every kind has its own cache branch. */
function createHooks<Item, Input>(kind: PublicationKind, api: ResourceApi<Item, Input>) {
  const all = ["publications", kind] as const;

  function useList(params: PublicationListParams) {
    return useQuery({
      queryKey: [...all, "list", params],
      queryFn: () => api.list(params),
      placeholderData: keepPreviousData,
    });
  }

  function useDetail(id: number | null) {
    return useQuery({
      queryKey: [...all, "detail", id],
      queryFn: () => api.get(id as number),
      enabled: id !== null,
    });
  }

  function useInvalidate() {
    const queryClient = useQueryClient();
    return () => void queryClient.invalidateQueries({ queryKey: all });
  }

  function useCreate() {
    const invalidate = useInvalidate();
    return useMutation({ mutationFn: (input: Input) => api.create(input), onSuccess: invalidate });
  }

  function useUpdate() {
    const invalidate = useInvalidate();
    return useMutation({
      mutationFn: ({ id, input }: { id: number; input: Input }) => api.update(id, input),
      onSuccess: invalidate,
    });
  }

  function useRemove() {
    const invalidate = useInvalidate();
    return useMutation({ mutationFn: (id: number) => api.remove(id), onSuccess: invalidate });
  }

  return { useList, useDetail, useCreate, useUpdate, useRemove };
}

export const newsHooks = createHooks("news", newsApi);
export const articleHooks = createHooks("articles", articlesApi);
export const videoHooks = createHooks("videos", videosApi);
