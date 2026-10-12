import type { PushLinkType, PushPlatform, PushSegment, PushStatus, PushTab } from "./types";

export const PUSH_PATH = "/content/push";

export const PUSH_TABS: PushTab[] = ["campaigns", "drafts"];

/** antd Tag colours of the statuses */
export const STATUS_COLOR: Record<PushStatus, string> = {
  published: "green",
  scheduled: "blue",
  draft: "default",
};

export const TITLE_MAX = 150;

export const SEGMENTS: PushSegment[] = ["all", "pro", "tashkent", "buyers_30d", "abandoned_cart"];

export const PLATFORMS: PushPlatform[] = ["all", "ios", "android"];

/** "" is "no link" (a free deeplink may be typed instead). */
export const LINK_TYPES: PushLinkType[] = ["", "category", "product", "badge", "page", "banner"];
