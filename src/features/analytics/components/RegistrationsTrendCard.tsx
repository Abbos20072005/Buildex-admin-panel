import { Alert, Segmented } from "antd";
import dayjs from "dayjs";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ChartTooltip,
  LineChart,
  percent,
  pointTitle,
  ProgressBar,
  useDashboardQuery,
  weekdayLabel,
} from "@/features/dashboard";
import { getErrorMessage } from "@/shared/api";
import { formatNumber } from "@/shared/lib/format";
import { ChartSkeleton, WidgetCard } from "@/shared/ui";
import { brand } from "@/theme";
import type { NewCustomersMonth, NewCustomersPeriod } from "../api/newCustomers.api";
import { useNewCustomersQuery } from "../hooks/queries";

type Span = "week" | "month" | "quarter" | "half" | "year" | "all";

const SPANS: Span[] = ["week", "month", "quarter", "half", "year", "all"];

/** A week and a month are drawn per day (the total only); longer spans per calendar month. */
const isDaily = (span: Span) => span === "week" || span === "month";

/** The monthly API has 6 / 12 months and all time: 3 months are the last 3 of the 6. */
const MONTHLY: Record<Exclude<Span, "week" | "month">, NewCustomersPeriod> = {
  quarter: "6_months",
  half: "6_months",
  year: "12_months",
  all: "all_time",
};

const isCurrent = (month: string) => dayjs(month).format("YYYY-MM") === dayjs().format("YYYY-MM");

/**
 * New customers: the total, and the mobile app / site split. A week or a month: per day (the API
 * splits only the total by day, so one line and the split bars); 3 / 6 / 12 months or all time:
 * per month, three lines (total, mobile app, site).
 */
export function RegistrationsTrendCard() {
  const { t } = useTranslation();
  const [span, setSpan] = useState<Span>("week");
  const daily = isDaily(span);

  const dailyQuery = useDashboardQuery(
    { range: { days: 30 }, months: 6, lowStock: 10, period: span === "month" ? "month" : "week" },
    daily,
  );
  const monthlyQuery = useNewCustomersQuery(
    daily ? "12_months" : MONTHLY[span as keyof typeof MONTHLY],
    !daily,
  );

  const days = dailyQuery.data?.registrations;
  const monthsAll = monthlyQuery.data?.months;
  const months: NewCustomersMonth[] | undefined =
    span === "quarter" ? monthsAll?.slice(-3) : monthsAll;

  const query = daily ? dailyQuery : monthlyQuery;
  const ready = daily ? !!days : !!months;
  const total = daily
    ? (days?.total ?? 0)
    : (months ?? []).reduce((sum, month) => sum + month.total, 0);
  const app = (months ?? []).reduce((sum, month) => sum + month.app, 0);
  const site = (months ?? []).reduce((sum, month) => sum + month.site, 0);
  const long = (months?.length ?? 0) > 12;

  const labels = daily
    ? (days?.points ?? []).map((point) =>
        span === "week" ? weekdayLabel(point.date, t) : dayjs(point.date).format("D"),
      )
    : (months ?? []).map(
        (m) => dayjs(m.month).format(long ? "MMM YY" : "MMM") + (isCurrent(m.month) ? "*" : ""),
      );

  const lines = daily
    ? [
        {
          key: "total",
          name: t("dashboard.monthly.total"),
          color: brand.yellow,
          values: (days?.points ?? []).map((point) => point.count),
        },
      ]
    : [
        {
          key: "total",
          name: t("dashboard.monthly.total"),
          color: brand.yellow,
          values: (months ?? []).map((m) => m.total),
        },
        {
          key: "app",
          name: t("dashboard.registrations.mobile"),
          color: brand.primary,
          values: (months ?? []).map((m) => m.app),
        },
        {
          key: "site",
          name: t("dashboard.registrations.web"),
          color: `${brand.primary}73`,
          values: (months ?? []).map((m) => m.site),
        },
      ];

  return (
    <WidgetCard
      title={t("dashboard.registrations.title")}
      extra={
        <Segmented<Span>
          size="small"
          value={span}
          onChange={setSpan}
          options={SPANS.map((value) => ({
            value,
            label: t(
              value === "all" ? "dashboard.monthly.period.allTime" : `dashboard.period.${value}`,
            ),
          }))}
        />
      }
    >
      {query.error && !ready ? (
        <Alert type="error" showIcon title={getErrorMessage(query.error)} />
      ) : !ready ? (
        <ChartSkeleton height={240} />
      ) : (
        <>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold tracking-tight tabular-nums">
              {formatNumber(total)}
            </span>
            <span className="text-sm font-semibold text-slate-500">
              {t("dashboard.monthly.unit")}
            </span>
          </div>

          <div className="mt-3">
            <LineChart
              width={1040}
              height={240}
              labels={labels}
              labelEvery={
                daily ? (span === "week" ? 1 : 5) : Math.max(1, Math.ceil(labels.length / 12))
              }
              series={lines}
              renderTooltip={(index) => {
                if (daily) {
                  const point = days!.points[index];
                  return (
                    <ChartTooltip
                      title={pointTitle(point.date, "day")}
                      rows={[
                        [t("dashboard.monthly.total"), formatNumber(point.count)],
                        [
                          t("dashboard.tip.share"),
                          percent(days!.total > 0 ? (point.count / days!.total) * 100 : 0),
                        ],
                      ]}
                    />
                  );
                }
                const month = months![index];
                return (
                  <ChartTooltip
                    title={
                      dayjs(month.month).format("MMMM YYYY") +
                      (isCurrent(month.month) ? ` (${t("dashboard.monthly.ongoing")})` : "")
                    }
                    rows={[
                      [t("dashboard.monthly.total"), formatNumber(month.total)],
                      [t("dashboard.registrations.mobile"), formatNumber(month.app)],
                      [t("dashboard.registrations.web"), formatNumber(month.site)],
                    ]}
                  />
                );
              }}
            />
          </div>

          {daily ? (
            days!.hasSplit && (
              <div className="mt-4 space-y-3 border-t border-slate-100 pt-4">
                {(
                  [
                    ["mobile", days!.mobilePercent, "bg-brand"],
                    ["web", days!.webPercent, "bg-brand/45"],
                  ] as const
                ).map(([key, value, colorClass]) => (
                  <div key={key}>
                    <div className="mb-1 flex justify-between text-sm">
                      <span>{t(`dashboard.registrations.${key}`)}</span>
                      <b>{percent(value)}</b>
                    </div>
                    <ProgressBar
                      percent={value}
                      colorClass={colorClass}
                      label={t(`dashboard.registrations.${key}`)}
                    />
                  </div>
                ))}
              </div>
            )
          ) : (
            <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 border-t border-slate-100 pt-3 text-xs text-slate-600">
              {lines.map((line) => (
                <span key={line.key} className="flex items-center gap-1.5">
                  <span className="size-2.5 rounded-full" style={{ background: line.color }} />
                  {line.name} ·{" "}
                  {formatNumber(line.key === "total" ? total : line.key === "app" ? app : site)}
                </span>
              ))}
              <span className="ml-auto text-slate-400">* {t("dashboard.stages.partial")}</span>
            </div>
          )}
        </>
      )}
    </WidgetCard>
  );
}
