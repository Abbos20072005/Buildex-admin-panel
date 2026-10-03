import type { BannerPlacement, BannerStatus, BannerTab, LinkType } from "./types";

export const PLACEMENTS: BannerPlacement[] = ["site_home", "app_home", "catalog"];

export const TABS: BannerTab[] = [...PLACEMENTS, "archive"];

export const LINK_TYPES: LinkType[] = ["category", "product", "badge", "brand", "page", "url"];

/** link types whose address is an object picked from a list (`target`) */
export const TARGET_LINK_TYPES: LinkType[] = ["category", "product", "badge", "brand"];

/** antd Tag colours of the statuses */
export const STATUS_COLOR: Record<BannerStatus, string> = {
  active: "green",
  scheduled: "blue",
  expired: "gold",
  archived: "default",
};

export const BANNERS_PATH = "/content/banners";

/** the tab list shows everything of a placement — at most this many fit one request */
export const LIST_SIZE = 100;
