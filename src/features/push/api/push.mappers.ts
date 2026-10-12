import type { Query } from "@/shared/api";
import type {
  AudienceSegment,
  Push,
  PushImage,
  PushInput,
  PushStats,
  PushTab,
} from "../model/types";
import type { AudienceDto, PushDto, PushStatsDto } from "./push.dto";

const text = (value: string | null | undefined) => value ?? "";

export const mapPush = (dto: PushDto): Push => ({
  id: dto.id,
  title: dto.title,
  titleUz: text(dto.title_uz),
  titleRu: text(dto.title_ru),
  bodyUz: text(dto.description_uz),
  bodyRu: text(dto.description_ru),
  image: dto.image || null,
  linkType: dto.link_type ?? "",
  target: dto.target
    ? { model: dto.target.model, id: dto.target.id, name: dto.target.name ?? undefined }
    : null,
  page: text(dto.page),
  deeplink: text(dto.deeplink),
  segment: dto.segment ?? "all",
  platform: dto.platform ?? "all",
  publishAt: dto.publish_at,
  quietHours: dto.quiet_hours ?? false,
  isActive: dto.is_active,
  status: dto.status,
  reads: dto.reads_count,
  pushSentAt: dto.push_sent_at ?? null,
  pushDevices: dto.push_devices ?? 0,
  createdAt: dto.created_at,
  updatedAt: dto.updated_at,
});

export const mapStats = (dto: PushStatsDto): PushStats => ({
  published: dto.published,
  scheduled: dto.scheduled,
  draft: dto.draft,
  published30d: dto.published_30d,
  reads30d: dto.reads_30d,
});

export const mapAudience = (dto: AudienceDto): AudienceSegment => ({
  segment: dto.segment,
  customers: dto.customers,
  devices: dto.devices,
  devicesIos: dto.devices_ios,
  devicesAndroid: dto.devices_android,
});

/** Tab → list query: "Kampaniyalar" are the switched-on records, "Qoralamalar" the drafts. */
export const tabToQuery = (tab: PushTab): Query =>
  tab === "drafts" ? { status: "draft" } : { is_active: true };

/** The fields of one request, as plain values (JSON) — `null` is "empty". */
function fields(input: PushInput) {
  return {
    title_ru: input.titleRu.trim(),
    title_uz: input.titleUz.trim() || null,
    description_ru: input.bodyRu.trim(),
    description_uz: input.bodyUz.trim() || null,
    link_type: input.linkType,
    // the backend clears what doesn't fit the link type; a free deeplink only without a type
    target: input.linkType && input.linkType !== "page" ? input.target : null,
    page: input.linkType === "page" ? input.page.trim() : "",
    ...(input.linkType === "" ? { deeplink: input.deeplink.trim() } : {}),
    // locked after the push has gone out: not sent at all
    ...(input.segment ? { segment: input.segment } : {}),
    ...(input.platform ? { platform: input.platform } : {}),
    quiet_hours: input.quietHours,
    is_active: input.isActive,
    // left out — the backend publishes "now" (or keeps the saved time)
    ...(input.publishAt ? { publish_at: input.publishAt } : {}),
  };
}

/**
 * JSON, or multipart/form-data when a picture is sent or removed. In multipart `null` is an
 * empty string, a target is `target.model` + `target.id`, an empty `image` removes the picture.
 */
export function toBody(input: PushInput, image: PushImage): object | FormData {
  const data = fields(input);
  if (!image.file && !image.clear) return data;

  const form = new FormData();
  for (const [key, value] of Object.entries(data)) {
    if (key === "target") {
      const target = value as { model: string; id: number } | null;
      if (target) {
        form.append("target.model", target.model);
        form.append("target.id", String(target.id));
      }
    } else form.append(key, value === null ? "" : String(value));
  }
  if (image.file) form.append("image", image.file);
  else form.append("image", "");
  return form;
}
