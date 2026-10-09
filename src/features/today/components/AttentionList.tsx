import {
  ClockIcon,
  CommentIcon,
  DollarIcon,
  ExclamationIcon,
  FileSearchIcon,
  MegaphoneIcon,
  ImageIcon,
  QuestionCircleIcon,
  TagIcon,
  UserRemoveIcon,
} from "@/shared/icons";
import type { TFunction } from "i18next";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { formatMoney, formatOrderId } from "@/shared/lib/format";
import { WidgetCard } from "@/shared/ui";
import { relativeTime } from "../lib/time";
import type {
  AttentionGroup,
  AttentionItem,
  AttentionKey,
  AttentionLevel,
  Today,
} from "../model/types";

const ICONS: Record<AttentionKey, ReactNode> = {
  stale_pending_orders: <ClockIcon />,
  refund_pending_orders: <DollarIcon />,
  unassigned_orders: <UserRemoveIcon />,
  out_of_stock_products: <ExclamationIcon />,
  no_price_products: <TagIcon />,
  review_products: <FileSearchIcon />,
  unanswered_questions: <QuestionCircleIcon />,
  unanswered_chats: <CommentIcon />,
  moderation_queue: <FileSearchIcon />,
  expiring_banners: <ImageIcon />,
  draft_notifications: <MegaphoneIcon />,
};

const LEVEL_TONE: Record<AttentionLevel, string> = {
  danger: "bg-red-50 text-red-600",
  warning: "bg-amber-50 text-amber-600",
  info: "bg-brand-soft text-brand",
};

/** Where "Ochish" leads; only for lists that exist in the panel (undefined — no button). */
const TARGET: Partial<Record<AttentionKey, string>> = {
  stale_pending_orders: "/orders?tab=new",
  refund_pending_orders: "/orders",
  unassigned_orders: "/orders?tab=new",
  out_of_stock_products: "/products?tab=soldOut",
  no_price_products: "/products",
  review_products: "/products/moderation",
};

const GROUPS: AttentionGroup[] = ["orders", "catalog", "feedback", "content"];

/** "#28 594 · #28 588" for orders without a name, otherwise the names. */
function subtitle(item: AttentionItem, t: TFunction): string {
  const parts = item.objects.map((object) =>
    object.name ? object.name : formatOrderId(object.id),
  );
  const list = parts.join(" · ");
  return item.amount !== null
    ? [t("today.attention.amount", { total: formatMoney(item.amount) }), list]
        .filter(Boolean)
        .join(" · ")
    : list;
}

/** What needs doing now, grouped (orders → catalog → feedback → content), most urgent first. */
export function AttentionList({ data, now }: { data: Today["attention"]; now: string }) {
  const { t } = useTranslation();

  return (
    <WidgetCard
      title={
        <span className="flex items-center gap-2">
          {t("today.attention.title")}
          {data.total > 0 && (
            <span className="rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-bold text-red-600">
              {data.total}
            </span>
          )}
        </span>
      }
      extra={<span className="text-xs text-slate-500">{t("today.attention.sortedBy")}</span>}
      className="[&_.ant-card-body]:p-0!"
    >
      {data.items.length === 0 ? (
        <p className="m-0 px-5 py-8 text-center text-sm text-slate-500">
          {t("today.attention.allGood")}
        </p>
      ) : (
        GROUPS.map((group) => {
          const items = data.items.filter((item) => item.group === group);
          if (items.length === 0) return null;
          return (
            <div key={group}>
              <div className="border-y border-slate-100 bg-surface-alt px-5 py-2 text-xs font-bold tracking-wide text-slate-500 uppercase first:border-t-0">
                {t(`today.groups.${group}`)} <span className="font-medium">{items.length}</span>
              </div>
              <ul className="m-0 list-none p-0">
                {items.map((item) => {
                  const target = TARGET[item.key];
                  return (
                    <li
                      key={item.key}
                      className="flex items-center gap-3 border-b border-slate-100 px-5 py-3 last:border-b-0"
                    >
                      <span
                        className={`grid size-10 shrink-0 place-items-center rounded-xl text-base ${LEVEL_TONE[item.level]}`}
                      >
                        {ICONS[item.key]}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-bold">
                          {t(`today.attention.keys.${item.key}`, {
                            count: item.count,
                            days: data.bannerDays,
                          })}
                        </div>
                        <div className="truncate text-xs text-slate-500">{subtitle(item, t)}</div>
                      </div>
                      {item.date && (
                        <span
                          className={`shrink-0 text-xs font-semibold ${item.level === "danger" ? "text-red-600" : "text-slate-500"}`}
                        >
                          {relativeTime(item.date, now, t)}
                        </span>
                      )}
                      {target && (
                        <Link
                          to={target}
                          className="shrink-0 rounded-lg border border-slate-300 px-3 py-1 text-sm font-semibold text-inherit hover:border-brand hover:text-brand"
                        >
                          {t("today.attention.open")}
                        </Link>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })
      )}
    </WidgetCard>
  );
}
