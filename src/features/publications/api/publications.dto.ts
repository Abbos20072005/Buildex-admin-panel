/** Fields are `title`, `title_uz`, `title_ru`, `title_en` — read through `readLocalized`. */
export interface NewsDto {
  id: number;
  title: string;
  image?: string | null;
  created_at: string;
  [key: string]: unknown;
}

export interface ArticleDto {
  id: number;
  title: string;
  short_description: string;
  /** not in the list */
  description?: string;
  created_at: string;
}

export interface VideoDto {
  id: number;
  name: string;
  url: string;
  created_at: string;
  [key: string]: unknown;
}
