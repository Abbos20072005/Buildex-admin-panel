import dayjs from "dayjs";
import { useTranslation } from "react-i18next";
import { formatNumber } from "@/shared/lib/format";
import { brand } from "@/theme";
import { weekdayLabel } from "../lib/format";
import type { Dashboard, Period } from "../model/types";
import { LineChart } from "./charts/LineChart";
import { PeriodSwitch } from "./PeriodSwitch";
import { Change, WidgetCard } from "./Widgets";

interface Props {
  data: Dashboard["delivered"];
  period: Period;
  onPeriodChange: (period: Period) => void;
}

/** Delivered orders: revenue and average check per day, switchable between a week and a month. */
export function DeliveredOrdersCard({ data, period, onPeriodChange }: Props) {
  const { t } = useTranslation();
  const labels = data.points.map((point) => {
    if (data.step === "month") return dayjs(point.date).format("MMM");
    return period === "week" ? weekdayLabel(point.date, t) : dayjs(point.date).format("D");
  });

  return (
    <WidgetCard
      title={t("dashboard.delivered.title")}
      extra={<PeriodSwitch value={period} onChange={onPeriodChange} />}
    >
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-extrabold tracking-tight tabular-nums">
          {formatNumber(data.revenue)}
        </span>
        <span className="text-sm font-semibold text-slate-500">UZS</span>
        <Change value={data.change} />
      </div>

      <div className="mt-3">
        <LineChart
          labels={labels}
          labelEvery={period === "month" ? 5 : 1}
          series={[
            { key: "revenue", color: brand.primary, values: data.points.map((p) => p.revenue) },
            { key: "average", color: brand.yellow, values: data.points.map((p) => p.averageCheck) },
          ]}
        />
      </div>

      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 border-t border-slate-100 pt-3 text-xs text-slate-600">
        <span className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-full bg-brand" />
          {t("dashboard.delivered.revenue")}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-full bg-brand-yellow" />
          {t("dashboard.delivered.average")}
        </span>
        <span className="ml-auto text-slate-400">
          {t("dashboard.delivered.count", { count: data.count })}
        </span>
      </div>
    </WidgetCard>
  );
}
