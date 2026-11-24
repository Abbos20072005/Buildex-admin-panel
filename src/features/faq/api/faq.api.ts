import { api, type Page, type Paginated } from "@/shared/api";
import type {
  FaqItem,
  FaqItemInput,
  FaqItemListParams,
  FaqTopic,
  FaqTopicInput,
  FaqTopicListParams,
} from "../model/types";
import type { FaqItemDto, FaqTopicDto } from "./faq.dto";

const mapTopic = (dto: FaqTopicDto): FaqTopic => ({
  id: dto.id,
  name: dto.name,
  nameUz: dto.name_uz ?? "",
  nameRu: dto.name_ru ?? "",
  slug: dto.slug,
  position: dto.position,
  isActive: dto.is_active,
  itemsCount: dto.items_count,
  createdAt: dto.created_at,
});

const mapItem = (dto: FaqItemDto): FaqItem => ({
  id: dto.id,
  topic: {
    id: dto.topic.id,
    name: dto.topic.name,
    slug: dto.topic.slug,
    isActive: dto.topic.is_active,
  },
  question: dto.question,
  questionUz: dto.question_uz ?? "",
  questionRu: dto.question_ru ?? "",
  answerUz: dto.answer_uz ?? "",
  answerRu: dto.answer_ru ?? "",
  pageKeys: dto.page_keys ?? [],
  position: dto.position,
  isActive: dto.is_active,
  createdAt: dto.created_at,
});

const topicBody = (input: FaqTopicInput) => ({
  name_uz: input.nameUz.trim(),
  name_ru: input.nameRu.trim(),
  slug: input.slug.trim(),
  is_active: input.isActive,
});

const itemBody = (input: FaqItemInput) => ({
  topic: input.topicId,
  question_uz: input.questionUz.trim(),
  question_ru: input.questionRu.trim(),
  answer_uz: input.answerUz,
  answer_ru: input.answerRu,
  page_keys: input.pageKeys,
  is_active: input.isActive,
});

export const faqApi = {
  /** GET /admin/faq-topics/ — in the order of the site (`position`) */
  async listTopics({ page, pageSize }: FaqTopicListParams): Promise<Page<FaqTopic>> {
    const data = await api.get<Paginated<FaqTopicDto>>("/faq-topics/", {
      page,
      page_size: pageSize,
      ordering: "position",
    });
    return { total: data.count ?? data.results.length, items: data.results.map(mapTopic) };
  },

  async createTopic(input: FaqTopicInput): Promise<FaqTopic> {
    return mapTopic(await api.post<FaqTopicDto>("/faq-topics/", topicBody(input)));
  },

  async updateTopic(id: number, input: FaqTopicInput): Promise<FaqTopic> {
    return mapTopic(await api.patch<FaqTopicDto>(`/faq-topics/${id}/`, topicBody(input)));
  },

  /** PATCH { is_active } — the switch in the table */
  async setTopicActive(id: number, isActive: boolean): Promise<void> {
    await api.patch(`/faq-topics/${id}/`, { is_active: isActive });
  },

  /** DELETE — refused (400) while the topic has questions */
  async removeTopic(id: number): Promise<void> {
    await api.delete(`/faq-topics/${id}/`);
  },

  /** POST /admin/faq-topics/reorder/ — the index in the list becomes `position` */
  async reorderTopics(ids: number[]): Promise<void> {
    await api.post("/faq-topics/reorder/", { ids });
  },

  /** GET /admin/faq-items/ — by topic, then by the order inside the topic */
  async listItems({ filters, page, pageSize }: FaqItemListParams): Promise<Page<FaqItem>> {
    const data = await api.get<Paginated<FaqItemDto>>("/faq-items/", {
      search: filters.search?.trim() || undefined,
      topic: filters.topicId,
      page_key: filters.pageKey,
      is_active: filters.isActive,
      page,
      page_size: pageSize,
    });
    return { total: data.count ?? data.results.length, items: data.results.map(mapItem) };
  },

  async createItem(input: FaqItemInput): Promise<FaqItem> {
    return mapItem(await api.post<FaqItemDto>("/faq-items/", itemBody(input)));
  },

  async updateItem(id: number, input: FaqItemInput): Promise<FaqItem> {
    return mapItem(await api.patch<FaqItemDto>(`/faq-items/${id}/`, itemBody(input)));
  },

  async setItemActive(id: number, isActive: boolean): Promise<void> {
    await api.patch(`/faq-items/${id}/`, { is_active: isActive });
  },

  async removeItem(id: number): Promise<void> {
    await api.delete(`/faq-items/${id}/`);
  },

  /** POST /admin/faq-items/reorder/ — the questions of ONE topic */
  async reorderItems(ids: number[]): Promise<void> {
    await api.post("/faq-items/reorder/", { ids });
  },
};
