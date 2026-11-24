import type {
  Banner,
  BannerFiles,
  BannerInput,
  BannerStats,
  BannerTab,
  ImageSlot,
} from "../model/types";
import { TARGET_LINK_TYPES } from "../model/constants";
import type { Query } from "@/shared/api";
import type { BannerDto, BannerStatsDto } from "./banners.dto";

const text = (value: string | null | undefined) => value ?? "";

/** The form field of every picture slot. */
const IMAGE_FIELD: Record<ImageSlot, string> = {
  desktopUz: "desktop_image_uz",
  desktopRu: "desktop_image_ru",
  mobileUz: "mobile_image_uz",
  mobileRu: "mobile_image_ru",
};

export function mapBanner(dto: BannerDto): Banner {
  // the old `desktop_image` / `mobile_image` are the Russian ones (the same value)
  const ru = {
    desktop: dto.desktop_image_ru || dto.desktop_image || null,
    mobile: dto.mobile_image_ru || dto.mobile_image || null,
  };
  return {
    id: dto.id,
    code: dto.code,
    name: dto.title,
    nameUz: text(dto.title_uz),
    nameRu: text(dto.title_ru),
    desktopImage: ru.desktop,
    mobileImage: ru.mobile,
    pictures: {
      ru,
      uz: { desktop: dto.desktop_image_uz || null, mobile: dto.mobile_image_uz || null },
    },
    placement: dto.placement,
    showOnSite: dto.show_on_site,
    showOnIos: dto.show_on_ios,
    showOnAndroid: dto.show_on_android,
    linkType: dto.link_type,
    target: dto.target ? { ...dto.target, name: text(dto.target.name) } : null,
    page: text(dto.page),
    link: text(dto.link),
    startsAt: dto.starts_at,
    endsAt: dto.ends_at ?? null,
    position: dto.position,
    isVisible: dto.is_visible,
    status: dto.status,
  };
}

export const mapStats = (dto: BannerStatsDto): BannerStats => ({
  active: dto.active,
  scheduled: dto.scheduled,
  expired: dto.expired,
  archived: dto.archived,
  external: dto.external,
  homeTop: dto.home_top,
  homeBottom: dto.home_bottom,
  catalog: dto.catalog,
});

/** Tab → list query: a placement's visible banners, or everything in the archive. */
export function tabToQuery(tab: BannerTab): Query {
  return tab === "archive" ? { is_visible: false } : { placement: tab, is_visible: true };
}

/**
 * multipart/form-data (the banner has images). Only the address that fits the link type
 * is sent — the backend clears the rest anyway. An empty picture field removes the saved one.
 * One "Nomi" feeds the Russian title (required); the Uzbek one follows it unless it differs.
 */
export function toFormData(input: BannerInput, files: BannerFiles, current?: Banner): FormData {
  const form = new FormData();
  const set = (key: string, value: string | boolean) => form.append(key, String(value));
  const name = input.name.trim();
  const keepUz = !!current && !!current.nameUz && current.nameUz !== current.nameRu;

  set("title_ru", name);
  set("title_uz", keepUz ? current.nameUz : name);
  set("placement", input.placement);
  set("show_on_site", input.showOnSite);
  set("show_on_ios", input.showOnIos);
  set("show_on_android", input.showOnAndroid);
  set("link_type", input.linkType);
  if (TARGET_LINK_TYPES.includes(input.linkType) && input.target) {
    set("target.model", input.target.model);
    set("target.id", String(input.target.id));
  }
  if (input.linkType === "page") set("page", input.page.trim());
  if (input.linkType === "url") set("link", input.link.trim());
  set("starts_at", input.startsAt);
  // an empty ends_at means "no end date"
  set("ends_at", input.endsAt ?? "");
  set("is_visible", input.isVisible);

  for (const slot of Object.keys(IMAGE_FIELD) as ImageSlot[]) {
    const file = files[slot];
    if (file) form.append(IMAGE_FIELD[slot], file);
    // an empty value removes the saved picture; the Russian wide one is required, never removed
    else if (files.clear?.[slot] && slot !== "desktopRu") set(IMAGE_FIELD[slot], "");
  }
  return form;
}
