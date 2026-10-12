import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { pushApi } from "../api/push.api";
import type { PushImage, PushInput, PushLinkType, PushListParams } from "../model/types";

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

/** Audiences with their sizes — the numbers are of the moment of the request. */
export function useAudienceQuery() {
  return useQuery({
    queryKey: [...ALL, "audience"],
    queryFn: pushApi.audience,
    staleTime: 60_000,
  });
}

/** Records of the chosen link type for the target select. */
export function useTargetOptionsQuery(linkType: PushLinkType, search: string) {
  const lang = useTranslation().i18n.language;
  return useQuery({
    queryKey: [...ALL, "targets", lang, linkType, search],
    queryFn: () => pushApi.targets(linkType, search),
    enabled: linkType !== "" && linkType !== "page",
    staleTime: 30_000,
  });
}

export function useCreatePush() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: ({ input, image }: { input: PushInput; image: PushImage }) =>
      pushApi.create(input, image),
    onSuccess: invalidate,
  });
}

export function useUpdatePush() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: ({ id, input, image }: { id: number; input: PushInput; image: PushImage }) =>
      pushApi.update(id, input, image),
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
