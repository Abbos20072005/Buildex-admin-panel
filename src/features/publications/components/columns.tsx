import { ImageIcon } from "@/shared/icons";
import type { TableColumnsType } from "antd";
import type { TFunction } from "i18next";
import { formatDateTime } from "@/shared/lib/format";
import type { Article, NewsItem, Video } from "../model/types";

const created = <T extends { createdAt: string }>(t: TFunction): TableColumnsType<T>[number] => ({
  key: "created",
  title: t("publications.columns.created"),
  width: 160,
  render: (_, item) => <span className="text-slate-500">{formatDateTime(item.createdAt)}</span>,
});

export const newsColumns = (t: TFunction): TableColumnsType<NewsItem> => [
  {
    key: "image",
    width: 72,
    render: (_, item) => (
      <span className="grid size-12 place-items-center overflow-hidden rounded-lg border border-slate-200 bg-slate-50 text-slate-300">
        {item.image ? (
          <img src={item.image} alt="" className="size-full object-cover" />
        ) : (
          <ImageIcon />
        )}
      </span>
    ),
  },
  {
    key: "title",
    title: t("publications.columns.title"),
    render: (_, item) => <span className="font-bold">{item.name}</span>,
  },
  created<NewsItem>(t),
];

export const articleColumns = (t: TFunction): TableColumnsType<Article> => [
  {
    key: "title",
    title: t("publications.columns.title"),
    width: 320,
    render: (_, item) => <span className="font-bold">{item.title}</span>,
  },
  {
    key: "short",
    title: t("publications.columns.shortDescription"),
    ellipsis: true,
    render: (_, item) => <span className="text-slate-600">{item.shortDescription}</span>,
  },
  created<Article>(t),
];

export const videoColumns = (t: TFunction): TableColumnsType<Video> => [
  {
    key: "name",
    title: t("publications.columns.name"),
    render: (_, item) => <span className="font-bold">{item.name}</span>,
  },
  {
    key: "url",
    title: t("publications.columns.link"),
    ellipsis: true,
    render: (_, item) => (
      <a
        href={item.url}
        target="_blank"
        rel="noreferrer"
        onClick={(event) => event.stopPropagation()}
      >
        {item.url}
      </a>
    ),
  },
  created<Video>(t),
];
