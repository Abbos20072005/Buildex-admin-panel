import { StarIcon } from "@/shared/icons";
import { Tag, type TableColumnsType } from "antd";
import type { TFunction } from "i18next";
import { formatDateTime, formatPhone } from "@/shared/lib/format";
import { InitialsAvatar } from "@/shared/ui";
import { authorTitle } from "../lib/display";
import type { FeedbackItem, FeedbackKind } from "../model/types";
import { ReviewPhotos } from "./ReviewPhotos";

/**
 * № · Mijoz · Sharh (Savol) · Baho (reviews) · Holati · Sana · Tovar
 * (the "⋯" column is added by RecordsTable). `offset` — how many rows the previous pages hold.
 */
export const feedbackColumns = (
  t: TFunction,
  kind: FeedbackKind,
  offset: number,
): TableColumnsType<FeedbackItem> => [
  {
    key: "number",
    title: "№",
    width: 56,
    render: (_, __, index) => <span className="text-slate-500">{offset + index + 1}</span>,
  },
  {
    key: "customer",
    title: t("feedback.columns.customer"),
    width: 220,
    render: (_, item) => (
      <div className="flex items-center gap-3">
        <InitialsAvatar name={authorTitle(item.customer, t)} />
        <div className="min-w-0">
          <div className="truncate font-bold">{authorTitle(item.customer, t)}</div>
          {item.customer?.phone && (
            <div className="font-mono text-xs text-slate-500">{formatPhone(item.customer.phone)}</div>
          )}
        </div>
      </div>
    ),
  },
  {
    key: "text",
    title: t(kind === "reviews" ? "feedback.columns.review" : "feedback.columns.question"),
    width: 320,
    render: (_, item) => (
      <div className="line-clamp-2 text-sm break-words">
        {item.text || <span className="text-slate-400">—</span>}
      </div>
    ),
  },
  ...(kind === "reviews"
    ? [
        {
          key: "images",
          title: t("feedback.columns.image"),
          width: 150,
          render: (_: unknown, item: FeedbackItem) => <ReviewPhotos images={item.images} />,
        },
      ]
    : []),
  ...(kind === "reviews"
    ? [
        {
          key: "rating",
          title: t("feedback.columns.rating"),
          width: 100,
          render: (_: unknown, item: FeedbackItem) => (
            <span className="inline-flex items-center gap-1.5 font-semibold tabular-nums">
              <StarIcon className="text-base text-amber-400" />
              {item.rating}
            </span>
          ),
        },
      ]
    : []),
  {
    key: "status",
    title: t("feedback.columns.status"),
    width: 150,
    render: (_, item) => (
      <div className="flex flex-col items-start gap-1">
        <Tag
          color={item.isVisible ? "green" : "default"}
          variant="filled"
          className="m-0 font-semibold"
        >
          {t(item.isVisible ? "feedback.status.visible" : "feedback.status.hidden")}
        </Tag>
        <Tag
          color={item.repliesCount > 0 ? "blue" : "orange"}
          variant="filled"
          className="m-0 font-semibold"
        >
          {t(item.repliesCount > 0 ? "feedback.status.answered" : "feedback.status.waiting")}
        </Tag>
      </div>
    ),
  },
  {
    key: "created",
    title: t("feedback.columns.created"),
    width: 160,
    render: (_, item) => formatDateTime(item.createdAt),
  },
  {
    key: "product",
    title: t("feedback.columns.product"),
    width: 280,
    render: (_, item) =>
      item.product ? (
        <div className="min-w-0">
          <div className="line-clamp-2 text-sm">{item.product.name}</div>
          {item.product.code && (
            <div className="font-mono text-xs text-slate-500">{item.product.code}</div>
          )}
        </div>
      ) : (
        <span className="text-slate-400">—</span>
      ),
  },
];
