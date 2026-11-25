import type { FaqCategory, FaqPageKey } from "../model/types";

export interface FaqItemDto {
  id: number;
  category: FaqCategory;
  category_name: string;
  question: string;
  question_uz: string;
  question_ru: string;
  answer: string;
  answer_uz: string;
  answer_ru: string;
  page_keys: FaqPageKey[];
  position: number;
  is_active: boolean;
  created_at: string;
}
