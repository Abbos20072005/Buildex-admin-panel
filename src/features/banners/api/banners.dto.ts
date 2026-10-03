/** Raw shapes of GET/POST/PATCH /admin/banners/ — only the mappers touch these. */

import type { BannerPlacement, BannerStatus, LinkType, TargetModel } from "../model/types";

export interface BannerDto {
  id: number;
  code: string;
  title: string;
  title_uz?: string | null;
  title_ru?: string | null;
  desktop_image?: string | null;
  mobile_image?: string | null;
  placement: BannerPlacement;
  show_on_site: boolean;
  show_on_ios: boolean;
  show_on_android: boolean;
  link_type: LinkType;
  target?: { model: TargetModel; id: number; name?: string | null } | null;
  page?: string | null;
  link?: string | null;
  starts_at: string;
  ends_at?: string | null;
  position: number;
  is_visible: boolean;
  status: BannerStatus;
}

export interface BannerStatsDto {
  active: number;
  scheduled: number;
  expired: number;
  archived: number;
  external: number;
  site_home: number;
  app_home: number;
  catalog: number;
}

/** `{ id, name }` of a category / product / badge / brand list */
export interface NamedDto {
  id: number;
  name: string;
}
