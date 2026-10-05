import type { PushStatus } from "../model/types";

/** `title` / `description` are in the request language; `_uz` / `_ru` / `_en` are the stored values. */
export interface PushDto {
  id: number;
  title: string;
  title_uz?: string | null;
  title_ru?: string | null;
  description_uz?: string | null;
  description_ru?: string | null;
  deeplink?: string | null;
  publish_at: string;
  is_active: boolean;
  status: PushStatus;
  reads_count: number;
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
