/** Pages of the site / app a question can be shown on (`page_keys` of the API). */
export const FAQ_PAGE_KEYS = [
  "faq",
  "courier-delivery",
  "payment-methods",
  "returns",
  "pickup",
  "legal-entities",
  "pro",
] as const;
export type FaqPageKey = (typeof FAQ_PAGE_KEYS)[number];

export const DEFAULT_PAGE_KEYS: FaqPageKey[] = ["faq"];

/** The fixed categories (tabs of the site's FAQ page), in the order of the site. */
export const FAQ_CATEGORIES = ["general", "technical", "payment", "orders", "delivery"] as const;
export type FaqCategory = (typeof FAQ_CATEGORIES)[number];

export interface FaqItem {
  id: number;
  category: FaqCategory;
  /** the Russian (default) text */
  question: string;
  questionUz: string;
  questionRu: string;
  /** HTML */
  answerUz: string;
  answerRu: string;
  pageKeys: FaqPageKey[];
  position: number;
  isActive: boolean;
  createdAt: string;
}

/** What the question form sends (POST / PATCH /admin/faq-items/). */
export interface FaqItemInput {
  category: FaqCategory;
  questionUz: string;
  questionRu: string;
  answerUz: string;
  answerRu: string;
  pageKeys: FaqPageKey[];
  isActive: boolean;
}

export interface FaqItemFilters {
  search?: string;
  category?: FaqCategory;
  pageKey?: FaqPageKey;
  isActive?: boolean;
}

export interface FaqItemListParams {
  filters: FaqItemFilters;
  page: number;
  pageSize: number;
}
