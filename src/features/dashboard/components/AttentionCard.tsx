import {
  CheckIcon,
  ClockIcon,
  CommentIcon,
  ExclamationIcon,
  FileSearchIcon,
  QuestionCircleIcon,
} from "@/shared/icons";
import dayjs from "dayjs";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import type { Dashboard } from "../model/types";
import { WidgetCard } from "./Widgets";

interface Item {
  key: string;
  icon: ReactNode;
  /** Tailwind classes of the icon bubble */
  tone: string;
  title: string;
  subtitle?: string;
  /** where "Ko'rish" leads; no link when the page does not exist yet */
  to?: string;
}

/** What needs the admin's attention: sold-out products, stale orders, questions, moderation. */
export function AttentionCard({ data }: { data: Dashboard["attention"] }) {
  const { t } = useTranslation();

  const items: Item[] = [];
  if (data.outOfStock > 0) {
    items.push({
      key: "stock",
      icon: <ExclamationIcon />,
      tone: "bg-red-50 text-red-600",
      title: t("dashboard.attention.outOfStock", { count: data.outOfStock }),
      subtitle: data.outOfStockCategories.join(" · "),
      to: "/products?tab=soldOut",
    });
  }
  if (data.stalePendingOrders > 0) {
    items.push({
      key: "orders",
      icon: <ClockIcon />,
      tone: "bg-amber-50 text-amber-600",
      title: t("dashboard.attention.stalePending", { count: data.stalePendingOrders }),
      subtitle: t("dashboard.attention.staleHours", { hours: data.pendingHours }),
      to: "/orders?tab=new",
    });
  }
  if (data.unansweredQuestions > 0) {
    items.push({
      key: "questions",
      icon: <QuestionCircleIcon />,
      tone: "bg-brand-soft text-brand",
      title: t("dashboard.attention.questions", { count: data.unansweredQuestions }),
    });
  }
  if (data.unansweredChats > 0) {
    items.push({
      key: "chats",
      icon: <CommentIcon />,
      tone: "bg-brand-soft text-brand",
      title: t("dashboard.attention.chats", { count: data.unansweredChats }),
    });
  }
  if (data.moderationQueue > 0) {
    items.push({
      key: "moderation",
      icon: <FileSearchIcon />,
      tone: "bg-brand-soft text-brand",
      title: t("dashboard.attention.moderation", { count: data.moderationQueue }),
      subtitle: t("dashboard.attention.moderationHint"),
      to: "/products/moderation",
    });
  }
  if (data.lastStockSync) {
    items.push({
      key: "sync",
      icon: <CheckIcon />,
      tone: "bg-green-50 text-green-700",
      title: t("dashboard.attention.syncDone"),
      subtitle: t("dashboard.attention.syncTime", {
        time: dayjs(data.lastStockSync).format("DD.MM HH:mm"),
      }),
    });
  }

  return (
    <WidgetCard
      title={t("dashboard.attention.title")}
      extra={
        data.total > 0 ? (
          <span className="rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-bold text-red-600">
            {data.total}
          </span>
        ) : null
      }
      className="[&_.ant-card-body]:p-0!"
    >
      {items.length === 0 ? (
        <p className="m-0 px-5 py-8 text-center text-sm text-slate-500">
          {t("dashboard.attention.allGood")}
        </p>
      ) : (
        <ul className="m-0 list-none p-0">
          {items.map((item) => (
            <li
              key={item.key}
              className="flex items-center gap-3 border-t border-slate-100 px-5 py-3 first:border-t-0"
            >
              <span
                className={`grid size-10 shrink-0 place-items-center rounded-xl text-base ${item.tone}`}
              >
                {item.icon}
              </span>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-bold">{item.title}</div>
                {item.subtitle && (
                  <div className="truncate text-xs text-slate-500">{item.subtitle}</div>
                )}
              </div>
              {item.to && (
                <Link to={item.to} className="shrink-0 text-sm font-semibold">
                  {t("dashboard.attention.view")}
                </Link>
              )}
            </li>
          ))}
        </ul>
      )}
    </WidgetCard>
  );
}
