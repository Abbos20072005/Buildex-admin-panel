import type { Query } from "@/shared/api";
import type { Push, PushInput, PushStats, PushTab } from "../model/types";
import type { PushDto, PushStatsDto } from "./push.dto";

const text = (value: string | null | undefined) => value ?? "";

export const mapPush = (dto: PushDto): Push => ({
  id: dto.id,
  title: dto.title,
  titleUz: text(dto.title_uz),
  titleRu: text(dto.title_ru),
  bodyUz: text(dto.description_uz),
  bodyRu: text(dto.description_ru),
  deeplink: text(dto.deeplink),
  publishAt: dto.publish_at,
  isActive: dto.is_active,
  status: dto.status,
  reads: dto.reads_count,
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

/** Tab → list query: "Kampaniyalar" are the switched-on records, "Qoralamalar" the drafts. */
export const tabToQuery = (tab: PushTab): Query =>
  tab === "drafts" ? { status: "draft" } : { is_active: true };

/** Russian is required; an empty Uzbek text is sent as null (customers then see Russian). */
export const inputToDto = (input: PushInput) => ({
  title_ru: input.titleRu.trim(),
  title_uz: input.titleUz.trim() || null,
  description_ru: input.bodyRu.trim(),
  description_uz: input.bodyUz.trim() || null,
  deeplink: input.deeplink.trim(),
  is_active: input.isActive,
  // left out — the backend publishes "now" (or keeps the saved time)
  ...(input.publishAt ? { publish_at: input.publishAt } : {}),
});
