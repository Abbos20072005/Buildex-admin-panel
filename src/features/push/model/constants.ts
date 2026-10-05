import type { PushStatus, PushTab } from "./types";

export const PUSH_PATH = "/content/push";

export const PUSH_TABS: PushTab[] = ["campaigns", "drafts"];

/** antd Tag colours of the statuses */
export const STATUS_COLOR: Record<PushStatus, string> = {
  published: "green",
  scheduled: "blue",
  draft: "default",
};

export const TITLE_MAX = 150;
