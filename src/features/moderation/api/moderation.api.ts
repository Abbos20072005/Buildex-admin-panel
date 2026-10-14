import { api, type Page, type Paginated } from "@/shared/api";
import {
  READINESS_KEYS,
  type BulkApproveResult,
  type ModerationDetail,
  type ModerationItem,
  type ModerationListParams,
  type ModerationProduct,
  type ModerationStats,
  type ModerationStatus,
  type Person,
  type PreviewProduct,
  type Readiness,
  type ReadinessKey,
} from "../model/types";

/* ---------- raw shapes of /admin/moderation/ ---------- */

interface PersonDto {
  id: number;
  username?: string;
  full_name?: string;
}
interface ReadinessDto {
  done: number;
  total: number;
  ready: boolean;
  missing?: string[];
  checks?: { key: string; done: boolean }[];
  missing_attributes?: { id: number; name?: string; name_uz?: string; name_ru?: string }[];
}
interface ProductDto {
  id: number;
  name?: string | null;
  name_uz?: string | null;
  name_ru?: string | null;
  product_code?: string | null;
  articul_code?: string | null;
  image?: string | null;
  description_uz?: string | null;
  description_ru?: string | null;
  brand?: { id: number; name: string } | null;
  product_item_category?: {
    name?: string;
    product_sub_category?: {
      name?: string;
      product_category?: { name?: string } | null;
    } | null;
  } | null;
  price?: number | string | null;
  discount_price?: number | string | null;
  unit?: string | null;
  quantity?: number | null;
  images?: { id: number; image: string; position?: number }[];
  attribute_values?: {
    name_uz?: string | null;
    name_ru?: string | null;
    value_uz?: string | null;
    value_ru?: string | null;
    unit_uz?: string | null;
    unit_ru?: string | null;
  }[];
}
interface ItemDto {
  id: number;
  status: ModerationStatus;
  product: ProductDto;
  submitted_by: PersonDto | string | null;
  submitted_at: string;
  waiting_seconds: number | null;
  reviewed_by: PersonDto | string | null;
  reviewed_at: string | null;
  reason: string | null;
  readiness: ReadinessDto;
}
interface StatsDto {
  pending: number;
  approved: number;
  rejected: number;
  approved_today: number;
  rejected_today: number;
  avg_wait_seconds: number | null;
  oldest_wait_seconds: number | null;
}
interface BulkApproveDto {
  approved?: number[];
  skipped?: { id: number; reason: string; missing?: string[] }[];
}

const isKey = (key: string): key is ReadinessKey =>
  (READINESS_KEYS as readonly string[]).includes(key);

const person = (dto: PersonDto | string | null): Person | null => {
  if (!dto) return null;
  if (typeof dto === "string") return { id: 0, name: dto };
  return { id: dto.id, name: dto.full_name || dto.username || "" };
};

const readiness = (dto: ReadinessDto): Readiness => ({
  done: dto.done,
  total: dto.total,
  ready: dto.ready,
  missing: (dto.missing ?? []).filter(isKey),
});

const product = (dto: ProductDto): ModerationProduct => ({
  id: dto.id,
  name: dto.name || dto.name_uz || dto.name_ru || "",
  productCode: dto.product_code ?? null,
  articulCode: dto.articul_code ?? null,
  image: dto.image ?? null,
});

const money = (value: number | string | null | undefined) =>
  value === null || value === undefined || value === "" ? null : Number(value);

function mapItem(dto: ItemDto): ModerationItem {
  return {
    id: dto.id,
    status: dto.status,
    product: product(dto.product),
    submittedBy: person(dto.submitted_by),
    submittedAt: dto.submitted_at,
    waitingSeconds: dto.waiting_seconds ?? 0,
    reviewedBy: person(dto.reviewed_by),
    reviewedAt: dto.reviewed_at,
    reason: dto.reason ?? "",
    readiness: readiness(dto.readiness),
  };
}

function mapPreview(dto: ProductDto): PreviewProduct {
  const category = dto.product_item_category;
  const sub = category?.product_sub_category;
  return {
    ...product(dto),
    names: { uz: dto.name_uz ?? dto.name ?? "", ru: dto.name_ru ?? "" },
    descriptions: { uz: dto.description_uz ?? "", ru: dto.description_ru ?? "" },
    brand: dto.brand?.name ?? null,
    categoryPath: [sub?.product_category?.name, sub?.name, category?.name].filter(
      (name): name is string => !!name,
    ),
    price: money(dto.price),
    discountPrice: money(dto.discount_price),
    unit: dto.unit ?? null,
    quantity: dto.quantity ?? null,
    images: [...(dto.images ?? [])]
      .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
      .map((image) => image.image),
    attributes: (dto.attribute_values ?? []).map((item) => ({
      name: { uz: item.name_uz ?? "", ru: item.name_ru ?? "" },
      value: { uz: item.value_uz ?? "", ru: item.value_ru ?? "" },
      unit: { uz: item.unit_uz ?? "", ru: item.unit_ru ?? "" },
    })),
  };
}

function mapDetail(dto: ItemDto): ModerationDetail {
  return {
    ...mapItem(dto),
    product: mapPreview(dto.product),
    checks: (dto.readiness.checks ?? [])
      .filter((check): check is { key: ReadinessKey; done: boolean } => isKey(check.key))
      .map((check) => ({ key: check.key, done: check.done })),
    missingAttributes: (dto.readiness.missing_attributes ?? []).map((item) => ({
      id: item.id,
      name: item.name || item.name_uz || item.name_ru || "",
    })),
  };
}

export const moderationApi = {
  /** GET /admin/moderation/stats/ — doesn't depend on the list filters */
  async stats(): Promise<ModerationStats> {
    const dto = await api.get<StatsDto>("/moderation/stats/");
    return {
      pending: dto.pending,
      approved: dto.approved,
      rejected: dto.rejected,
      approvedToday: dto.approved_today,
      rejectedToday: dto.rejected_today,
      avgWaitSeconds: dto.avg_wait_seconds,
      oldestWaitSeconds: dto.oldest_wait_seconds,
    };
  },

  /** GET /admin/moderation/?status= */
  async list({
    status,
    search,
    page,
    pageSize,
  }: ModerationListParams): Promise<Page<ModerationItem>> {
    const data = await api.get<Paginated<ItemDto>>("/moderation/", {
      status,
      search: search || undefined,
      page,
      page_size: pageSize,
    });
    return { total: data.count ?? data.results.length, items: data.results.map(mapItem) };
  },

  /** GET /admin/moderation/{id}/ */
  async get(id: number): Promise<ModerationDetail> {
    return mapDetail(await api.get<ItemDto>(`/moderation/${id}/`));
  },

  /** POST /admin/moderation/{id}/approve/ — 400 {detail, missing} when the product isn't ready */
  async approve(id: number): Promise<ModerationDetail> {
    return mapDetail(await api.post<ItemDto>(`/moderation/${id}/approve/`));
  },

  /** POST /admin/moderation/{id}/reject/ — the reason is required (≤ 1000 characters) */
  async reject(id: number, reason: string): Promise<ModerationDetail> {
    return mapDetail(await api.post<ItemDto>(`/moderation/${id}/reject/`, { reason }));
  },

  /** POST /admin/moderation/bulk-approve/ — up to 100 row ids; the not-ready ones are skipped */
  async bulkApprove(ids: number[]): Promise<BulkApproveResult> {
    const dto = await api.post<BulkApproveDto>("/moderation/bulk-approve/", { ids });
    return {
      approved: dto.approved ?? [],
      skipped: (dto.skipped ?? []).map((item) => ({
        id: item.id,
        reason: item.reason === "not_ready" ? "not_ready" : "not_pending",
        missing: (item.missing ?? []).filter(isKey),
      })),
    };
  },
};
