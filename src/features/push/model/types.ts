/** Calculated by the backend: `is_active` + `publish_at`. */
export type PushStatus = "published" | "scheduled" | "draft";

/** The two tabs of the list: everything that is switched on, and the drafts. */
export type PushTab = "campaigns" | "drafts";

/** Who gets the notification. Locked once the push has gone out. */
export type PushSegment = "all" | "pro" | "tashkent" | "buyers_30d" | "abandoned_cart";

/** `all` is iOS and Android; an old app version's devices are only reached with `all`. */
export type PushPlatform = "all" | "ios" | "android";

/** What a tap opens; empty — nothing (or a free deeplink). */
export type PushLinkType = "" | "category" | "product" | "badge" | "page" | "banner";

/** `target.model` of the API. */
export type PushTargetModel =
  | "productcategory"
  | "productsubcategory"
  | "productitemcategory"
  | "product"
  | "productbadge"
  | "banner";

export interface PushTarget {
  model: PushTargetModel;
  id: number;
  /** only when it comes from the API */
  name?: string;
}

/** Bildirishnoma: a record shown inside the app / site and sent as a push to its audience. */
export interface Push {
  id: number;
  /** title in the admin UI language */
  title: string;
  titleUz: string;
  titleRu: string;
  bodyUz: string;
  bodyRu: string;
  /** picture in the push and in the list; null — none */
  image: string | null;
  linkType: PushLinkType;
  target: PushTarget | null;
  /** internal path, with `link_type=page` */
  page: string;
  /** made by the backend from the link; a free text when there is no link type */
  deeplink: string;
  segment: PushSegment;
  platform: PushPlatform;
  /** YYYY-MM-DDTHH:MM:SS, Tashkent time */
  publishAt: string;
  /** 22:00–09:00 moves the publish time to 09:00 */
  quietHours: boolean;
  isActive: boolean;
  status: PushStatus;
  /** customers who opened it */
  reads: number;
  /** when the push started to go out; null — not sent yet (segment / platform still editable) */
  pushSentAt: string | null;
  /** devices that got the push ("Yetkazildi") */
  pushDevices: number;
  createdAt: string;
  updatedAt: string;
}

/** What the form sends. English texts are not edited, so they stay as they are. */
export interface PushInput {
  titleUz: string;
  titleRu: string;
  bodyUz: string;
  bodyRu: string;
  linkType: PushLinkType;
  target: { model: PushTargetModel; id: number } | null;
  page: string;
  /** used only without a link type */
  deeplink: string;
  /** null — the audience is locked (the push has gone out) and is not sent */
  segment: PushSegment | null;
  platform: PushPlatform | null;
  quietHours: boolean;
  /** null — "now" (the field is left out) */
  publishAt: string | null;
  isActive: boolean;
}

/** The picture: a new file, or `clear` to remove the saved one. */
export interface PushImage {
  file?: File;
  clear?: boolean;
}

/** GET /admin/notifications/stats/ — not affected by list filters. */
export interface PushStats {
  published: number;
  scheduled: number;
  draft: number;
  published30d: number;
  reads30d: number;
}

/** One audience of GET /admin/notifications/audience/ with its size. */
export interface AudienceSegment {
  segment: PushSegment;
  customers: number;
  devices: number;
  devicesIos: number;
  devicesAndroid: number;
}

/** A record offered by the link target select. */
export interface TargetOption {
  model: PushTargetModel;
  id: number;
  name: string;
}

export interface PushListParams {
  tab: PushTab;
  page: number;
  pageSize: number;
}
