import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import type { Page } from "@/shared/api";
import { bannersApi } from "../api/banners.api";
import { bannerKeys } from "../api/query-keys";
import { TARGET_LINK_TYPES } from "../model/constants";
import type { Banner, BannerFiles, BannerInput, BannerTab, LinkType } from "../model/types";
import { useBulkMutation } from "@/shared/lib/useBulkMutation";

export function useBannersQuery(tab: BannerTab, page = 1) {
  return useQuery({
    queryKey: bannerKeys.list(tab, page),
    queryFn: () => bannersApi.list({ tab, page }),
    placeholderData: keepPreviousData,
  });
}

export function useBannerStatsQuery() {
  return useQuery({ queryKey: bannerKeys.stats(), queryFn: bannersApi.stats });
}

export function useBannerQuery(id: number | null) {
  return useQuery({
    queryKey: bannerKeys.detail(id ?? 0),
    queryFn: () => bannersApi.get(id as number),
    enabled: id !== null,
  });
}

/** Search for the "Manzil" field; names come in the UI language. */
export function useTargetOptionsQuery(linkType: LinkType, search: string) {
  const lang = useTranslation().i18n.language;
  return useQuery({
    queryKey: bannerKeys.targets(lang, linkType, search),
    queryFn: () => bannersApi.targets(linkType, search),
    enabled: TARGET_LINK_TYPES.includes(linkType),
    staleTime: 60_000,
    placeholderData: keepPreviousData,
  });
}

/** The customer-facing lists and the dashboard read banners too — refetch everything. */
function useInvalidateBanners() {
  const queryClient = useQueryClient();
  return () => {
    void queryClient.invalidateQueries({ queryKey: bannerKeys.all });
    void queryClient.invalidateQueries({ queryKey: ["today"] });
  };
}

export function useCreateBanner() {
  const invalidate = useInvalidateBanners();
  return useMutation({
    mutationFn: ({ input, files }: { input: BannerInput; files: BannerFiles }) =>
      bannersApi.create(input, files),
    onSuccess: invalidate,
  });
}

export function useUpdateBanner() {
  const invalidate = useInvalidateBanners();
  return useMutation({
    mutationFn: ({
      banner,
      input,
      files,
    }: {
      banner: Banner;
      input: BannerInput;
      files: BannerFiles;
    }) => bannersApi.update(banner, input, files),
    onSuccess: invalidate,
  });
}

export function useSetBannerVisible() {
  const invalidate = useInvalidateBanners();
  return useMutation({
    mutationFn: ({ id, isVisible }: { id: number; isVisible: boolean }) =>
      bannersApi.setVisible(id, isVisible),
    onSuccess: invalidate,
  });
}

export function useDeleteBanner() {
  const invalidate = useInvalidateBanners();
  return useMutation({
    mutationFn: (id: number) => bannersApi.remove(id),
    onSuccess: invalidate,
  });
}

/** The table is reordered at once, then confirmed (or rolled back) by the server. */
export function useReorderBanners() {
  const queryClient = useQueryClient();
  const invalidate = useInvalidateBanners();

  return useMutation({
    mutationFn: (ids: number[]) => bannersApi.reorder(ids),
    onMutate: (ids) => {
      const previous = queryClient.getQueriesData<Page<Banner>>({ queryKey: bannerKeys.lists() });
      const order = new Map(ids.map((id, index) => [id, index]));
      queryClient.setQueriesData<Page<Banner>>({ queryKey: bannerKeys.lists() }, (page) =>
        page
          ? {
              ...page,
              items: [...page.items].sort(
                (a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0),
              ),
            }
          : page,
      );
      return { previous };
    },
    onError: (_error, _ids, context) => {
      context?.previous.forEach(([key, data]) => queryClient.setQueryData(key, data));
    },
    onSettled: invalidate,
  });
}

/** Sets the field of every selected row (one request per row). */
export function useBulkSetBannerVisible() {
  return useBulkMutation<boolean>((id, value) => bannersApi.setVisible(id, value), bannerKeys.all);
}
