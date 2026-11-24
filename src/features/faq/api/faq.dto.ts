import type { FaqPageKey } from "../model/types";

export interface FaqTopicDto {
  id: number;
  name: string;
  name_uz: string;
  name_ru: string;
  slug: string;
  position: number;
  is_active: boolean;
  items_count: number;
  created_at: string;
}

export interface FaqItemDto {
  id: number;
  topic: { id: number; name: string; slug: string; is_active: boolean };
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
