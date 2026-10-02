import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import type { Page } from "@/shared/api";
import { badgesApi, type BadgesListParams } from "../api/badges.api";
import { badgeKeys } from "../api/query-keys";
import type { Badge, BadgeInput } from "../model/types";

export function useBadgesListQuery(params: Omit<BadgesListParams, "lang">) {
  const lang = useTranslation().i18n.language;
  const full = { ...params, lang };
  return useQuery({
    queryKey: badgeKeys.list(full),
    queryFn: () => badgesApi.list(full),
    placeholderData: keepPreviousData,
  });
}

/** The badge pickers of the products page read the badges too — refetch them after a change. */
function useInvalidateBadges() {
  const queryClient = useQueryClient();
  return () => {
    void queryClient.invalidateQueries({ queryKey: badgeKeys.all });
    void queryClient.invalidateQueries({ queryKey: ["product-badges"] });
    void queryClient.invalidateQueries({ queryKey: ["products"] });
  };
}

export function useCreateBadge() {
  const invalidate = useInvalidateBadges();
  return useMutation({
    mutationFn: (input: BadgeInput) => badgesApi.create(input),
    onSuccess: invalidate,
  });
}

export function useUpdateBadge() {
  const invalidate = useInvalidateBadges();
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: BadgeInput }) => badgesApi.update(id, input),
    onSuccess: invalidate,
  });
}

export function useDeleteBadge() {
  const invalidate = useInvalidateBadges();
  return useMutation({
    mutationFn: (id: number) => badgesApi.remove(id),
    onSuccess: invalidate,
  });
}

/** The table is reordered at once, then confirmed (or rolled back) by the server. */
export function useReorderBadges() {
  const queryClient = useQueryClient();
  const invalidate = useInvalidateBadges();

  return useMutation({
    mutationFn: (ids: number[]) => badgesApi.reorder(ids),
    onMutate: (ids) => {
      const previous = queryClient.getQueriesData<Page<Badge>>({ queryKey: badgeKeys.lists() });
      const order = new Map(ids.map((id, index) => [id, index]));
      queryClient.setQueriesData<Page<Badge>>({ queryKey: badgeKeys.lists() }, (page) =>
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
