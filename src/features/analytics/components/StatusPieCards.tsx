import { Alert, Segmented } from "antd";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { DonutChart, oneDecimal } from "@/features/dashboard";
import { getErrorMessage } from "@/shared/api";
import { formatNumber } from "@/shared/lib/format";
import { DonutSkeleton, WidgetCard } from "@/shared/ui";
import type { OrderStatusPeriod, PublishStatus } from "../api/statuses.api";
import { useOrderStatusesQuery, useProductStatusesQuery } from "../hooks/queries";

/** Order status by its API code (0–6): the key of the `status.*` labels and a fixed colour. */
const ORDER_STATUSES = [
  { key: "new", colorClass: "text-brand" },
  { key: "confirmed", colorClass: "text-sky-500" },
  { key: "assembling", colorClass: "text-brand-yellow" },
  { key: "onTheWay", colorClass: "text-violet-500" },
  { key: "readyForPickup", colorClass: "text-teal-500" },
  { key: "delivered", colorClass: "text-green-600" },
  { key: "cancelled", colorClass: "text-red-600" },
] as const;

/** Product states: "published / active" is green, "not visible" red, like "completed" / "canceled" above. */
const PUBLISH_COLORS: Record<PublishStatus, string> = {
  draft: "text-slate-400",
  review: "text-brand-yellow",
  published: "text-green-600",
};
const ACTIVITY_COLORS = { active: "text-green-600", inactive: "text-red-600" } as const;

const PERIODS: { value: OrderStatusPeriod; label: string }[] = [
  { value: "current_month", label: "currentMonth" },
  { value: "last_month", label: "lastMonth" },
  { value: "last_3_months", label: "last3Months" },
  { value: "year", label: "year" },
];

interface Row {
  key: string;
  label: string;
  count: number;
  percent: number;
  colorClass: string;
  /** a legend row that opens a list */
  to?: string;
}

/** A ring with the total in the middle and a legend: name, count and share of every part. */
function Pie({ rows, total, caption }: { rows: Row[]; total: number; caption: string }) {
  return (
    <div className="flex flex-wrap items-center gap-5">
      <DonutChart
        segments={rows.map((row) => ({
          key: row.key,
          label: row.label,
          value: row.count,
          colorClass: row.colorClass,
        }))}
      >
        <span className="text-lg leading-tight font-extrabold tabular-nums">
          {formatNumber(total)}
        </span>
        <span className="text-[11px] text-slate-500">{caption}</span>
      </DonutChart>
      <ul className="m-0 min-w-0 flex-1 list-none space-y-2 p-0 text-sm">
        {rows.map((row) => {
          const content = (
            <>
              <span className={`size-2.5 shrink-0 rounded-sm bg-current ${row.colorClass}`} />
              <span className="min-w-0 flex-1 truncate text-slate-700">{row.label}</span>
              <b className="tabular-nums">{formatNumber(row.count)}</b>
              <span className="w-12 text-right text-xs text-slate-500 tabular-nums">
                {oneDecimal(row.percent)}%
              </span>
            </>
          );
          return (
            <li key={row.key}>
              {row.to ? (
                <Link to={row.to} className="flex items-center gap-2 hover:opacity-80">
                  {content}
                </Link>
              ) : (
                <div className="flex items-center gap-2">{content}</div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/** Orders created in the chosen period, by their current status. A legend row opens that list. */
export function OrderStatusesCard() {
  const { t } = useTranslation();
  const [period, setPeriod] = useState<OrderStatusPeriod>("current_month");
  const query = useOrderStatusesQuery(period);
  const data = query.data;

  return (
    <WidgetCard
      title={t("dashboard.statuses.orders")}
      extra={
        <Segmented<OrderStatusPeriod>
          size="small"
          value={period}
          onChange={setPeriod}
          options={PERIODS.map((item) => ({
            value: item.value,
            label: t(`dashboard.statuses.period.${item.label}`),
          }))}
        />
      }
    >
      {query.error && !data ? (
        <Alert type="error" showIcon title={getErrorMessage(query.error)} />
      ) : !data ? (
        <DonutSkeleton />
      ) : data.total === 0 ? (
        <div className="grid h-36 place-content-center text-sm text-slate-500">
          {t("dashboard.statuses.noOrders")}
        </div>
      ) : (
        <Pie
          total={data.total}
          caption={t("dashboard.statuses.totalOrders")}
          rows={data.statuses.map((item) => {
            const status = ORDER_STATUSES[item.status];
            return {
              key: status.key,
              label: t(`status.${status.key}`),
              count: item.count,
              percent: item.percent,
              colorClass: status.colorClass,
              to: `/orders?tab=${status.key}&from=${data.dateFrom}&to=${data.dateTo}`,
            };
          })}
        />
      )}
    </WidgetCard>
  );
}

/** All products now: by moderation state, or by visibility to customers. */
export function ProductStatusesCard() {
  const { t } = useTranslation();
  const [view, setView] = useState<"publish" | "activity">("publish");
  const query = useProductStatusesQuery();
  const data = query.data;

  const rows: Row[] = !data
    ? []
    : view === "publish"
      ? data.publish.map((item) => ({
          key: item.status,
          label: t(`publishStatus.${item.status}`),
          count: item.count,
          percent: item.percent,
          colorClass: PUBLISH_COLORS[item.status],
        }))
      : data.activity.map((item) => ({
          key: String(item.active),
          label: t(item.active ? "dashboard.statuses.active" : "dashboard.statuses.inactive"),
          count: item.count,
          percent: item.percent,
          colorClass: item.active ? ACTIVITY_COLORS.active : ACTIVITY_COLORS.inactive,
        }));

  return (
    <WidgetCard
      title={t("dashboard.statuses.products")}
      extra={
        <Segmented<"publish" | "activity">
          size="small"
          value={view}
          onChange={setView}
          options={[
            { value: "publish", label: t("dashboard.statuses.byPublish") },
            { value: "activity", label: t("dashboard.statuses.byActivity") },
          ]}
        />
      }
    >
      {query.error && !data ? (
        <Alert type="error" showIcon title={getErrorMessage(query.error)} />
      ) : !data ? (
        <DonutSkeleton />
      ) : data.total === 0 ? (
        <div className="grid h-36 place-content-center text-sm text-slate-500">
          {t("dashboard.statuses.noProducts")}
        </div>
      ) : (
        <Pie total={data.total} caption={t("dashboard.statuses.totalProducts")} rows={rows} />
      )}
    </WidgetCard>
  );
}
