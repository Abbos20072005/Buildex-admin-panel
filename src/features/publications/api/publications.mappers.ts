import type { Query } from "@/shared/api";
import { readLocalized, writeLocalized } from "@/shared/lib/localized";
import type {
  Article,
  ArticleInput,
  NewsInput,
  NewsItem,
  PublicationFilters,
  Video,
  VideoInput,
} from "../model/types";
import type { ArticleDto, NewsDto, VideoDto } from "./publications.dto";

export const mapNews = (dto: NewsDto): NewsItem => ({
  id: dto.id,
  name: dto.title,
  title: readLocalized(dto, "title"),
  description: readLocalized(dto, "description"),
  image: dto.image || null,
  createdAt: dto.created_at,
});

export const mapArticle = (dto: ArticleDto): Article => ({
  id: dto.id,
  title: dto.title,
  shortDescription: dto.short_description,
  description: dto.description ?? "",
  createdAt: dto.created_at,
});

export const mapVideo = (dto: VideoDto): Video => ({
  id: dto.id,
  name: dto.name,
  title: readLocalized(dto, "name"),
  url: dto.url,
  createdAt: dto.created_at,
});

export const filtersToQuery = (filters: PublicationFilters): Query => ({
  search: filters.search?.trim() || undefined,
  from_created: filters.from,
  to_created: filters.to,
});

/**
 * News has a picture, so it goes as multipart. When it is created, empty optional languages
 * are left out; when it is edited, they are sent as "" to clear them.
 */
export function newsToFormData(input: NewsInput, editing: boolean): FormData {
  const form = new FormData();
  const body = {
    ...writeLocalized("title", input.title),
    ...writeLocalized("description", input.description),
  };
  for (const [key, value] of Object.entries(body)) {
    if (value !== null) form.append(key, value);
    else if (editing) form.append(key, "");
  }
  if (input.image) form.append("image", input.image);
  return form;
}

/** Without a new picture the edit is a plain JSON PATCH. */
export const newsToBody = (input: NewsInput, editing: boolean): FormData | object =>
  input.image || !editing
    ? newsToFormData(input, editing)
    : {
        ...writeLocalized("title", input.title),
        ...writeLocalized("description", input.description),
      };

export const articleToBody = (input: ArticleInput) => ({
  title: input.title.trim(),
  short_description: input.shortDescription.trim(),
  description: input.description,
});

export const videoToBody = (input: VideoInput) => ({
  ...writeLocalized("name", input.title),
  url: input.url.trim(),
});
