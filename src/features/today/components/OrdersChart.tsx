import dayjs from "dayjs";
import { useTranslation } from "react-i18next";
import { LineChart } from "@/features/dashboard";
import { formatNumber } from "@/shared/lib/format";
import { WidgetCard } from "@/shared/ui";
import { brand } from "@/theme";
import type { Today } from "../model/types";

const WEEKDAYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"] as const;

/** Orders per day for the last 7 days; today's column is lighter (it is still filling up). */
export function OrdersChart({ data, now }: { data: Today["ordersChart"]; now: string }) {
  const { t } = useTranslation();
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
      <LineChart
        width={1040}
        height={240}
        showValues
        labels={data.points.map((point) =>
          point.date === today
            ? t("today.chart.today")
            : `${t(`today.weekdays.${WEEKDAYS[dayjs(point.date).day()]}`)} ${dayjs(point.date).format("DD.MM")}`,
        )}
        series={[
          { key: "orders", color: brand.primary, values: data.points.map((point) => point.count) },
        ]}
      />

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
