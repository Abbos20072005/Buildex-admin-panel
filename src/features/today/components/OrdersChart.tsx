import dayjs from "dayjs";
import { useTranslation } from "react-i18next";
import { clsx } from "@/shared/lib/clsx";
import { formatMoney, formatNumber } from "@/shared/lib/format";
import { WidgetCard } from "@/shared/ui";
import type { Today } from "../model/types";

const WEEKDAYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"] as const;

/** Orders per day for the last 7 days; today's column is lighter (it is still filling up). */
export function OrdersChart({ data, now }: { data: Today["ordersChart"]; now: string }) {
  const { t } = useTranslation();
  const max = Math.max(1, ...data.points.map((point) => point.count));
  const today = dayjs(now).format("YYYY-MM-DD");
  const first = data.points[0];
  const last = data.points[data.points.length - 1];

  return (
    <WidgetCard
      title={t("today.chart.title", { count: data.days })}
      extra={
        first && last ? (
          <span className="text-xs text-slate-500">
            {dayjs(first.date).format("DD.MM")} – {dayjs(last.date).format("DD.MM.YYYY")}
          </span>
        ) : null
      }
    >
      <div className="flex h-44 items-end gap-3">
        {data.points.map((point) => {
          const isToday = point.date === today;
          return (
            <div key={point.date} className="flex h-full min-w-0 flex-1 flex-col justify-end">
              <div className="mb-1 text-center text-xs font-semibold tabular-nums">
                {point.count}
              </div>
              <div
                title={formatMoney(point.total)}
                className={clsx("w-full rounded-t-md", isToday ? "bg-brand/45" : "bg-brand")}
                style={{ height: `${Math.max(2, (point.count / max) * 80)}%` }}
              />
            </div>
          );
        })}
      </div>
      <div className="mt-2 flex gap-3 text-center text-[11px] text-slate-500">
        {data.points.map((point) => (
          <div key={point.date} className="min-w-0 flex-1">
            <div className={clsx(point.date === today && "font-bold text-slate-900")}>
              {point.date === today
                ? t("today.chart.today")
                : t(`today.weekdays.${WEEKDAYS[dayjs(point.date).day()]}`)}
            </div>
            <div className="text-slate-400">{dayjs(point.date).format("DD.MM")}</div>
          </div>
        ))}
      </div>

      <div className="mt-4 flex gap-8 border-t border-slate-100 pt-3">
        <div>
          <div className="text-xs text-slate-500">{t("today.chart.total")}</div>
          <div className="text-xl font-extrabold tabular-nums">{formatNumber(data.count)}</div>
        </div>
        <div>
          <div className="text-xs text-slate-500">{t("today.chart.average")}</div>
          <div className="text-xl font-extrabold tabular-nums">
            {formatNumber(data.averagePerDay)}
          </div>
        </div>
      </div>
      <p className="m-0 mt-2 text-xs text-slate-400">{t("today.chart.todayNote")}</p>
    </WidgetCard>
  );
}
