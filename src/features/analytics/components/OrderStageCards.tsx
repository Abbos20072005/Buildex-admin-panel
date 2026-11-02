import { Alert, Segmented, Skeleton } from "antd";
import dayjs from "dayjs";
import { useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { BarChart, formatDuration, LineChart, oneDecimal } from "@/features/dashboard";
import { getErrorMessage } from "@/shared/api";
import { WidgetCard } from "@/shared/ui";
import { brand } from "@/theme";
import type { StageDelivery, StageKey, StageMonth, StagePeriod } from "../api/orderStages.api";
import { useOrderStagesQuery } from "../hooks/queries";

const PERIODS: { value: StagePeriod; label: "quarter" | "half" | "year" }[] = [
  { value: "quarter", label: "quarter" },
  { value: "half_year", label: "half" },
  { value: "year", label: "year" },
];
const DELIVERY: StageDelivery[] = ["all", "courier", "pickup"];

/** The chart draws in hours until the longest stage passes a day, then in days. */
const unitSeconds = (maxSeconds: number) => (maxSeconds < 86_400 ? 3_600 : 86_400);

const isCurrent = (month: string) => month === dayjs().format("YYYY-MM");

const monthLabel = (month: string) =>
  dayjs(`${month}-01`).format("MMM") + (isCurrent(month) ? "*" : "");

function PeriodSegmented({
  value,
  onChange,
}: {
  value: StagePeriod;
  onChange: (value: StagePeriod) => void;
}) {
  const { t } = useTranslation();
  return (
    <Segmented<StagePeriod>
      size="small"
      value={value}
      onChange={onChange}
      options={PERIODS.map((item) => ({
        value: item.value,
        label: t(`dashboard.period.${item.label}`),
      }))}
    />
  );
}

/** The tooltip rows of one month: average, median and the number of orders of a stage. */
function StageTooltip({
  data,
  rows,
}: {
  data: StageMonth;
  rows: { key: StageKey; name: string; color: string }[];
}) {
  const { t } = useTranslation();
  return (
    <>
      <div className="mb-1 text-slate-300">
        {dayjs(`${data.month}-01`).format("MMMM YYYY")}
        {isCurrent(data.month) && ` (${t("dashboard.stages.ongoing")})`}
      </div>
      {rows.map((row) => {
        const value = data[row.key];
        return (
          <div key={row.key} className="flex items-center gap-1.5">
            <span className="size-2 rounded-full" style={{ background: row.color }} />
            <span className="text-slate-300">{row.name}:</span>
            {value.avgSeconds === null || value.medianSeconds === null ? (
              <b>{t("dashboard.stages.noData")}</b>
            ) : (
              <b className="tabular-nums">
                {t("dashboard.stages.tooltip", {
                  average: formatDuration(value.avgSeconds, t),
                  median: formatDuration(value.medianSeconds, t),
                  count: value.count,
                })}
              </b>
            )}
          </div>
        );
      })}
    </>
  );
}

function Body({
  months,
  error,
  children,
}: {
  months: StageMonth[] | undefined;
  error: unknown;
  children: (months: StageMonth[]) => ReactNode;
}) {
  const { t } = useTranslation();
  if (error && !months) return <Alert type="error" showIcon title={getErrorMessage(error)} />;
  if (!months) return <Skeleton active paragraph={{ rows: 5 }} />;
  return (
    <>
      {children(months)}
      {months.some((item) => isCurrent(item.month)) && (
        <div className="mt-2 text-xs text-slate-400">* {t("dashboard.stages.partial")}</div>
      )}
    </>
  );
}

/** Average time an order waits to be confirmed and to go to preparation, per month. */
export function OrderStageTimeCard() {
  const { t } = useTranslation();
  const [period, setPeriod] = useState<StagePeriod>("quarter");
  const query = useOrderStagesQuery(period);

  const rows: { key: StageKey; name: string; color: string }[] = [
    { key: "confirm", name: t("dashboard.stages.confirm"), color: brand.primary },
    { key: "toPreparing", name: t("dashboard.stages.toPreparing"), color: brand.yellow },
  ];

  return (
    <WidgetCard
      title={t("dashboard.stages.title")}
      extra={<PeriodSegmented value={period} onChange={setPeriod} />}
    >
      <Body months={query.data} error={query.error}>
        {(months) => {
          const unit = unitSeconds(
            Math.max(
              0,
              ...months.flatMap((m) => [m.confirm.avgSeconds ?? 0, m.toPreparing.avgSeconds ?? 0]),
            ),
          );
          return (
            <>
              <LineChart
                width={520}
                height={240}
                showValues
                labels={months.map((m) => monthLabel(m.month))}
                series={rows.map((row) => ({
                  key: row.key,
                  name: row.name,
                  color: row.color,
                  values: months.map((m) => {
                    const seconds = m[row.key].avgSeconds;
                    return seconds === null ? null : seconds / unit;
                  }),
                }))}
                formatValue={(value) => formatDuration(value * unit, t)}
                formatAxis={oneDecimal}
                renderTooltip={(index) => <StageTooltip data={months[index]} rows={rows} />}
              />
              <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 border-t border-slate-100 pt-3 text-xs text-slate-600">
                {rows.map((row) => (
                  <span key={row.key} className="flex items-center gap-1.5">
                    <span className="size-2.5 rounded-full" style={{ background: row.color }} />
                    {row.name}
                  </span>
                ))}
              </div>
            </>
          );
        }}
      </Body>
    </WidgetCard>
  );
}

/** Average time from placing an order to completing it, per month; courier / pickup filter. */
export function DeliveryTimeCard() {
  const { t } = useTranslation();
  const [period, setPeriod] = useState<StagePeriod>("quarter");
  const [method, setMethod] = useState<StageDelivery>("all");
  const query = useOrderStagesQuery(period, method);

  const rows: { key: StageKey; name: string; color: string }[] = [
    { key: "delivery", name: t("dashboard.stages.delivery"), color: brand.primary },
  ];

  return (
    <WidgetCard
      title={t("dashboard.stages.deliveryTitle")}
      extra={
        <div className="flex flex-wrap items-center gap-2">
          <Segmented<StageDelivery>
            size="small"
            value={method}
            onChange={setMethod}
            options={DELIVERY.map((value) => ({
              value,
              label: t(`dashboard.stages.method.${value}`),
            }))}
          />
          <PeriodSegmented value={period} onChange={setPeriod} />
        </div>
      }
    >
      <Body months={query.data} error={query.error}>
        {(months) => {
          const unit = unitSeconds(Math.max(0, ...months.map((m) => m.delivery.avgSeconds ?? 0)));
          return (
            <BarChart
              height={240}
              color={brand.primary}
              labels={months.map((m) => monthLabel(m.month))}
              values={months.map((m) =>
                m.delivery.avgSeconds === null ? null : m.delivery.avgSeconds / unit,
              )}
              faded={(index) => isCurrent(months[index].month)}
              formatAxis={oneDecimal}
              renderTooltip={(index) => <StageTooltip data={months[index]} rows={rows} />}
            />
          );
        }}
      </Body>
    </WidgetCard>
  );
}
