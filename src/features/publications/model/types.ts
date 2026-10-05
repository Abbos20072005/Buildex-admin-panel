import type { Localized } from "@/shared/lib/localized";

/** The three kinds of site publications managed on one page. */
export type PublicationKind = "news" | "articles" | "videos";

export const PUBLICATION_KINDS: PublicationKind[] = ["news", "articles", "videos"];

export interface PublicationFilters {
  search?: string;
  /** YYYY-MM-DD, both borders included */
  from?: string;
  to?: string;
}

export interface PublicationListParams {
  filters: PublicationFilters;
  page: number;
  pageSize: number;
}

/** Yangilik. The list has no `description` (heavy HTML) — it comes with `GET news/{id}/`. */
export interface NewsItem {
  id: number;
  /** title in the admin UI language */
  name: string;
  title: Localized;
  description: Localized;
  image: string | null;
  createdAt: string;
}

export interface NewsInput {
  title: Localized;
  description: Localized;
  /** required on create; a new file replaces the saved one */
  image?: File;
}

/** Maqola: one language-independent value per field, no picture. */
export interface Article {
  id: number;
  title: string;
  shortDescription: string;
  description: string;
  createdAt: string;
}

export interface ArticleInput {
  title: string;
  shortDescription: string;
  description: string;
}

/** Video: only a link, nothing is uploaded. */
export interface Video {
  id: number;
  name: string;
  title: Localized;
  url: string;
  createdAt: string;
}

export interface VideoInput {
  title: Localized;
  url: string;
}
