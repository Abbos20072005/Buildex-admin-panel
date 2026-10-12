import type {
  PushLinkType,
  PushPlatform,
  PushSegment,
  PushStatus,
  PushTargetModel,
} from "../model/types";

/** `title` / `description` are in the request language; `_uz` / `_ru` / `_en` are the stored values. */
export interface PushDto {
  id: number;
  title: string;
  title_uz?: string | null;
  title_ru?: string | null;
  description_uz?: string | null;
  description_ru?: string | null;
  image?: string | null;
  link_type?: PushLinkType | null;
  target?: { model: PushTargetModel; id: number; name?: string | null } | null;
  page?: string | null;
  deeplink?: string | null;
  segment?: PushSegment;
  platform?: PushPlatform;
  publish_at: string;
  quiet_hours?: boolean;
  is_active: boolean;
  status: PushStatus;
  reads_count: number;
  push_sent_at?: string | null;
  push_devices?: number;
  created_at: string;
  updated_at: string;
}

export interface PushStatsDto {
  published: number;
  scheduled: number;
  draft: number;
  published_30d: number;
  reads_30d: number;
}

export interface AudienceDto {
  segment: PushSegment;
  customers: number;
  devices: number;
  devices_ios: number;
  devices_android: number;
}

/** `{ id, name }` of a category / product / badge / banner list (a banner has `title`). */
export interface TargetDto {
  id: number;
  name?: string | null;
  title?: string | null;
  title_ru?: string | null;
}
