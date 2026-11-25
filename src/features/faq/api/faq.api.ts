import { api, type Page, type Paginated } from "@/shared/api";
import type { FaqItem, FaqItemInput, FaqItemListParams } from "../model/types";
import type { FaqItemDto } from "./faq.dto";

const mapItem = (dto: FaqItemDto): FaqItem => ({
  id: dto.id,
  category: dto.category,
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

const itemBody = (input: FaqItemInput) => ({
  category: input.category,
  question_uz: input.questionUz.trim(),
  question_ru: input.questionRu.trim(),
  answer_uz: input.answerUz,
  answer_ru: input.answerRu,
  page_keys: input.pageKeys,
  is_active: input.isActive,
});

export const faqApi = {
  /** GET /admin/faq-items/ — by category, then by the order inside the category */
  async listItems({ filters, page, pageSize }: FaqItemListParams): Promise<Page<FaqItem>> {
    const data = await api.get<Paginated<FaqItemDto>>("/faq-items/", {
      search: filters.search?.trim() || undefined,
      category: filters.category,
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

  /** POST /admin/faq-items/reorder/ — the questions of ONE category */
  async reorderItems(ids: number[]): Promise<void> {
    await api.post("/faq-items/reorder/", { ids });
  },
};
