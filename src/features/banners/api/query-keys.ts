import type { BannerTab, LinkType } from "../model/types";

/** Query-key factory — one place that defines the cache structure of the banners feature. */
export const bannerKeys = {
  all: ["banners-admin"] as const,
  lists: () => [...bannerKeys.all, "list"] as const,
  list: (tab: BannerTab, page: number) => [...bannerKeys.lists(), tab, page] as const,
  stats: () => [...bannerKeys.all, "stats"] as const,
  detail: (id: number) => [...bannerKeys.all, "detail", id] as const,
  targets: (lang: string, linkType: LinkType, search: string) =>
    [...bannerKeys.all, "targets", lang, linkType, search] as const,
};
