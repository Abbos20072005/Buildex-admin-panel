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

export interface FaqTopic {
  id: number;
  /** name in the Russian (default) language */
  name: string;
  nameUz: string;
  nameRu: string;
  slug: string;
  position: number;
  isActive: boolean;
  itemsCount: number;
  createdAt: string;
}

/** What the topic form sends (POST / PATCH /admin/faq-topics/). */
export interface FaqTopicInput {
  nameUz: string;
  nameRu: string;
  slug: string;
  isActive: boolean;
}

export interface FaqTopicRef {
  id: number;
  name: string;
  slug: string;
  isActive: boolean;
}

export interface FaqItem {
  id: number;
  topic: FaqTopicRef;
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
  topicId: number;
  questionUz: string;
  questionRu: string;
  answerUz: string;
  answerRu: string;
  pageKeys: FaqPageKey[];
  isActive: boolean;
}

export interface FaqItemFilters {
  search?: string;
  topicId?: number;
  pageKey?: FaqPageKey;
  isActive?: boolean;
}

export interface FaqItemListParams {
  filters: FaqItemFilters;
  page: number;
  pageSize: number;
}

export interface FaqTopicListParams {
  page: number;
  pageSize: number;
}
