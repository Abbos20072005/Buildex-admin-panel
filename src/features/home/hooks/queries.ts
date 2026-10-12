import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { homeApi } from "../api/home.api";
import type { Device, PreviewSource } from "../model/preview";
import type { Channel, HomeBlock, HomeBlockInput, HomeRulesInput } from "../model/types";

/** Query-key root of the feature. */
const ALL = ["home"] as const;
const blocksKey = (channel: Channel, lang: string) => [...ALL, "blocks", channel, lang] as const;

/** Blocks of one tab, in the page order (titles come in the UI language). */
export function useHomeBlocksQuery(channel: Channel) {
  const lang = useTranslation().i18n.language;
  return useQuery({
    queryKey: blocksKey(channel, lang),
    queryFn: () => homeApi.blocks(channel),
  });
}

/** Display rules and the publish state ("Nashr qilish" is active while `hasChanges`). */
export function useHomePageQuery() {
  return useQuery({ queryKey: [...ALL, "page"], queryFn: homeApi.page });
}

function useInvalidate() {
  const queryClient = useQueryClient();
  return () => void queryClient.invalidateQueries({ queryKey: ALL });
}

export function useCreateBlock() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (input: HomeBlockInput) => homeApi.createBlock(input),
    onSuccess: invalidate,
  });
}

export function useUpdateBlock() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: HomeBlockInput }) =>
      homeApi.updateBlock(id, input),
    onSuccess: invalidate,
  });
}

export function useSetBlockVisible() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: ({ id, isVisible }: { id: number; isVisible: boolean }) =>
      homeApi.setVisible(id, isVisible),
    onSuccess: invalidate,
  });
}

export function useDeleteBlock() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (id: number) => homeApi.removeBlock(id),
    onSuccess: invalidate,
  });
}

/** Drag & drop: the new order shows at once and is rolled back if the request fails. */
export function useReorderBlocks(channel: Channel) {
  const queryClient = useQueryClient();
  const lang = useTranslation().i18n.language;
  const invalidate = useInvalidate();
  const key = blocksKey(channel, lang);

  return useMutation({
    mutationFn: (ids: number[]) => homeApi.reorder(ids),
    onMutate: async (ids) => {
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<HomeBlock[]>(key);
      if (previous) {
        const order = new Map(ids.map((id, index) => [id, index]));
        queryClient.setQueryData<HomeBlock[]>(
          key,
          [...previous].sort((a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0)),
        );
      }
      return { previous };
    },
    onError: (_error, _ids, context) => {
      if (context?.previous) queryClient.setQueryData(key, context.previous);
    },
    onSettled: invalidate,
  });
}

export function useSaveRules() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (input: HomeRulesInput) => homeApi.saveRules(input),
    onSuccess: invalidate,
  });
}

export function usePublishHome() {
  const invalidate = useInvalidate();
  return useMutation({ mutationFn: homeApi.publish, onSuccess: invalidate });
}

/**
 * The content a block would show, for the preview. The key holds only what changes the
 * result, so typing in a title doesn't refetch.
 */
export function usePreviewItems(source: PreviewSource, device: Device) {
  const { type, bannerPlacement, bannerId, badgeId, saleId } = source;
  return useQuery({
    queryKey: [...ALL, "preview", device, type, bannerPlacement, bannerId, badgeId, saleId],
    queryFn: () => homeApi.preview(source, device),
    staleTime: 60_000,
    retry: false,
  });
}

/** Records for the source select of a block type. */
export function useSourceOptions(kind: "banners" | "badges" | "sales", enabled: boolean) {
  const lang = useTranslation().i18n.language;
  return useQuery({
    queryKey: [...ALL, "options", kind, lang],
    queryFn: () => homeApi[kind](),
    enabled,
    staleTime: 60_000,
  });
}
