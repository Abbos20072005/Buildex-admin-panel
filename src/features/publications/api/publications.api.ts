import { api, type Page, type Paginated } from "@/shared/api";
import type {
  Article,
  ArticleInput,
  NewsInput,
  NewsItem,
  PublicationListParams,
  Video,
  VideoInput,
} from "../model/types";
import type { ArticleDto, NewsDto, VideoDto } from "./publications.dto";
import {
  articleToBody,
  filtersToQuery,
  mapArticle,
  mapNews,
  mapVideo,
  newsToBody,
  videoToBody,
} from "./publications.mappers";

export interface ResourceApi<Item, Input> {
  list: (params: PublicationListParams) => Promise<Page<Item>>;
  get: (id: number) => Promise<Item>;
  create: (input: Input) => Promise<Item>;
  update: (id: number, input: Input) => Promise<Item>;
  remove: (id: number) => Promise<void>;
}

/** list / get / create / update / delete of one `/admin/<path>/` resource, newest first. */
function resource<Dto, Item, Input>(
  path: string,
  map: (dto: Dto) => Item,
  toBody: (input: Input, editing: boolean) => FormData | object,
): ResourceApi<Item, Input> {
  return {
    async list({ filters, page, pageSize }) {
      const data = await api.get<Paginated<Dto>>(`/${path}/`, {
        ...filtersToQuery(filters),
        page,
        page_size: pageSize,
        ordering: "-created_at",
      });
      return { total: data.count ?? data.results.length, items: data.results.map(map) };
    },
    async get(id) {
      return map(await api.get<Dto>(`/${path}/${id}/`));
    },
    async create(input) {
      return map(await api.post<Dto>(`/${path}/`, toBody(input, false)));
    },
    async update(id, input) {
      return map(await api.patch<Dto>(`/${path}/${id}/`, toBody(input, true)));
    },
    async remove(id) {
      await api.delete(`/${path}/${id}/`);
    },
  };
}

/** /admin/news/ — multipart (the picture is required on create) */
export const newsApi = resource<NewsDto, NewsItem, NewsInput>("news", mapNews, newsToBody);

/** /admin/articles/ — JSON */
export const articlesApi = resource<ArticleDto, Article, ArticleInput>(
  "articles",
  mapArticle,
  (input) => articleToBody(input),
);

/** /admin/videos/ — JSON, a link only */
export const videosApi = resource<VideoDto, Video, VideoInput>("videos", mapVideo, (input) =>
  videoToBody(input),
);
