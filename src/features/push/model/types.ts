/** Calculated by the backend: `is_active` + `publish_at`. */
export type PushStatus = "published" | "scheduled" | "draft";

/** The two tabs of the list: everything that is switched on, and the drafts. */
export type PushTab = "campaigns" | "drafts";

/** Bildirishnoma: one record shown to all customers inside the app / site. */
export interface Push {
  id: number;
  /** title in the admin UI language */
  title: string;
  titleUz: string;
  titleRu: string;
  bodyUz: string;
  bodyRu: string;
  /** buildex://category/sement — the format is not checked by the backend */
  deeplink: string;
  /** YYYY-MM-DDTHH:MM:SS, Tashkent time */
  publishAt: string;
  isActive: boolean;
  status: PushStatus;
  /** customers who opened it */
  reads: number;
  createdAt: string;
  updatedAt: string;
}

/** What the form sends. English texts are not edited, so they stay as they are. */
export interface PushInput {
  titleUz: string;
  titleRu: string;
  bodyUz: string;
  bodyRu: string;
  deeplink: string;
  /** null — "now" (the field is left out) */
  publishAt: string | null;
  isActive: boolean;
}

/** GET /admin/notifications/stats/ — not affected by list filters. */
export interface PushStats {
  published: number;
  scheduled: number;
  draft: number;
  published30d: number;
  reads30d: number;
}

export interface PushListParams {
  tab: PushTab;
  page: number;
  pageSize: number;
}
