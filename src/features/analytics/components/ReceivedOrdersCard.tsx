import { Alert, Segmented } from "antd";
import dayjs from "dayjs";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Change,
  ChartTooltip,
  LineChart,
  PeriodSwitch,
  pointTitle,
  spans,
  toApiPeriod,
  useDashboardQuery,
  weekdayLabel,
  type Period,
} from "@/features/dashboard";
import { getErrorMessage } from "@/shared/api";
import { formatNumber } from "@/shared/lib/format";
import { ChartSkeleton, WidgetCard } from "@/shared/ui";
import { brand } from "@/theme";

type Metric = "all" | "count" | "revenue" | "average";

/** The three lines: the count, the sum and the average order price. */
const LINES = [
  { key: "count", label: "dashboard.tip.count", color: brand.primary },
  { key: "revenue", label: "dashboard.tip.sum", color: brand.success },
  { key: "average", label: "dashboard.tip.average", color: brand.yellow },
] as const;

/**
 * Orders that came in (every status): the count, the sum and the average price per day, or per
 * month for 3 / 6 / 12 months. "All" draws the three lines each on its own scale (their units
 * differ), one metric alone is drawn with its real axis.
 */
export function ReceivedOrdersCard() {
  const { t } = useTranslation();
  const [period, setPeriod] = useState<Period>("week");
  const [metric, setMetric] = useState<Metric>("all");
  const query = useDashboardQuery({
    range: { days: 30 },
    months: 6,
    lowStock: 10,
    period: toApiPeriod(period),
  });
  const received = query.data?.received;
  const block = received ? spans.delivered(received, period) : null;

  const monthly = block?.step === "month";
  const labels = (block?.points ?? []).map((point) =>
    monthly
      ? dayjs(point.date).format("MMM")
      : period === "week"
        ? weekdayLabel(point.date, t)
        : dayjs(point.date).format("D"),
  );

  const raw = {
    count: (block?.points ?? []).map((point) => point.count),
    revenue: (block?.points ?? []).map((point) => point.revenue),
    average: (block?.points ?? []).map((point) => Math.round(point.averageCheck)),
  };
  const shown = LINES.filter((line) => metric === "all" || metric === line.key);
  // together the lines are put on one scale (each against its own maximum): the shape, not the
  // unit. Lines that run over each other (the same busy days) hide one another; with more
  // statistics they separate.
  const series = shown.map((line) => {
    const max = Math.max(1, ...raw[line.key]);
    return {
      key: line.key,
      name: t(line.label),
      color: line.color,
      values: metric === "all" ? raw[line.key].map((value) => (value / max) * 100) : raw[line.key],
    };
  });

  return (
    <WidgetCard
      title={t("dashboard.received.title")}
      extra={<PeriodSwitch value={period} onChange={setPeriod} />}
    >
      {query.error && !block ? (
        <Alert type="error" showIcon title={getErrorMessage(query.error)} />
      ) : !query.data ? (
        <ChartSkeleton />
      ) : !block ? (
        <div className="py-10 text-center text-sm text-slate-400">{t("common.noData")}</div>
      ) : (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-extrabold tracking-tight tabular-nums">
                {formatNumber(block.count)}
              </span>
              <span className="text-sm font-semibold text-slate-500">
                {t("dashboard.received.unit")}
              </span>
              <Change value={block.countChange} />
            </div>
            <Segmented<Metric>
              size="small"
              value={metric}
              onChange={setMetric}
              options={[
                { value: "all", label: t("common.all") },
                ...LINES.map((line) => ({ value: line.key, label: t(line.label) })),
              ]}
            />
          </div>

          <div className="mt-3">
            <LineChart
              width={520}
              height={220}
              labels={labels}
              labelEvery={monthly || period === "week" ? 1 : 5}
              series={series}
              formatAxis={metric === "all" ? () => "" : undefined}
              renderTooltip={(index) => {
                const point = block.points[index];
                return (
                  <ChartTooltip
                    title={pointTitle(point.date, block.step)}
                    rows={[
                      [t("dashboard.tip.count"), formatNumber(point.count)],
                      [t("dashboard.tip.sum"), formatNumber(point.revenue)],
                      [t("dashboard.tip.average"), formatNumber(Math.round(point.averageCheck))],
                    ]}
                  />
                );
              }}
            />
          </div>

          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 border-t border-slate-100 pt-3 text-xs text-slate-600">
            {shown.map((line) => (
              <span key={line.key} className="flex items-center gap-1.5">
                <span className="size-2.5 rounded-full" style={{ background: line.color }} />
                {t(line.label)}
              </span>
            ))}
          </div>
        </>
      )}
    </WidgetCard>
  );
}
