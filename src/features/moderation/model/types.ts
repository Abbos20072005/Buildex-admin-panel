export type ModerationStatus = "pending" | "approved" | "rejected";

/** Items of the readiness checklist, in the order the API returns them. */
export const READINESS_KEYS = [
  "name_uz",
  "name_ru",
  "description_uz",
  "description_ru",
  "image",
  "required_attributes",
  "category",
  "brand",
] as const;

export type ReadinessKey = (typeof READINESS_KEYS)[number];

export interface Person {
  id: number;
  name: string;
}

export interface Readiness {
  done: number;
  total: number;
  ready: boolean;
  missing: ReadinessKey[];
}

export interface ModerationProduct {
  id: number;
  name: string;
  productCode: string | null;
  articulCode: string | null;
  image: string | null;
}

/** A row of the queue / history. */
export interface ModerationItem {
  id: number;
  status: ModerationStatus;
  product: ModerationProduct;
  submittedBy: Person | null;
  submittedAt: string;
  /** pending: since it was submitted; reviewed: how long it waited before the review */
  waitingSeconds: number;
  reviewedBy: Person | null;
  reviewedAt: string | null;
  reason: string;
  readiness: Readiness;
}

export type Localized = { uz: string; ru: string };

export interface PreviewAttribute {
  name: Localized;
  value: Localized;
  unit: Localized;
}

/** What the modal shows as a preview of the product card. */
export interface PreviewProduct extends ModerationProduct {
  names: Localized;
  descriptions: Localized;
  brand: string | null;
  /** root → leaf */
  categoryPath: string[];
  price: number | null;
  discountPrice: number | null;
  unit: string | null;
  quantity: number | null;
  images: string[];
  attributes: PreviewAttribute[];
}

export interface ReadinessCheckItem {
  key: ReadinessKey;
  done: boolean;
}

export interface MissingAttribute {
  id: number;
  name: string;
}

export interface ModerationDetail extends Omit<ModerationItem, "product"> {
  product: PreviewProduct;
  checks: ReadinessCheckItem[];
  missingAttributes: MissingAttribute[];
}

export interface ModerationStats {
  pending: number;
  approved: number;
  rejected: number;
  approvedToday: number;
  rejectedToday: number;
  /** null while the queue is empty */
  avgWaitSeconds: number | null;
  oldestWaitSeconds: number | null;
}

export interface ModerationListParams {
  status: ModerationStatus;
  search?: string;
  page: number;
  pageSize: number;
}

export interface BulkApproveResult {
  approved: number[];
  skipped: { id: number; reason: "not_ready" | "not_pending"; missing: ReadinessKey[] }[];
}
