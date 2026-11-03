import { Alert, Segmented, Skeleton } from "antd";
import dayjs from "dayjs";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ChartTooltip, LineChart } from "@/features/dashboard";
import { getErrorMessage } from "@/shared/api";
import { formatNumber } from "@/shared/lib/format";
import { WidgetCard } from "@/shared/ui";
import { brand } from "@/theme";
import type { NewCustomersPeriod } from "../api/newCustomers.api";
import { useNewCustomersQuery } from "../hooks/queries";

const PERIODS: { value: NewCustomersPeriod; label: string }[] = [
  { value: "6_months", label: "months6" },
  { value: "12_months", label: "months12" },
  { value: "all_time", label: "allTime" },
];

const isCurrent = (month: string) => dayjs(month).format("YYYY-MM") === dayjs().format("YYYY-MM");

/** New verified customers per month: the total and the mobile app / site split. */
export function NewCustomersCard() {
  const { t } = useTranslation();
  const [period, setPeriod] = useState<NewCustomersPeriod>("12_months");
  const query = useNewCustomersQuery(period);
  const data = query.data;

  // same colours as the mobile / web bars of the registrations card
  const lines = data
    ? [
        {
          key: "total",
          name: t("dashboard.monthly.total"),
          color: brand.yellow,
          values: data.months.map((m) => m.total),
        },
        {
          key: "app",
          name: t("dashboard.registrations.mobile"),
          color: brand.primary,
          values: data.months.map((m) => m.app),
        },
        {
          key: "site",
          name: t("dashboard.registrations.web"),
          color: `${brand.primary}73`,
          values: data.months.map((m) => m.site),
        },
      ]
    : [];
  const long = (data?.months.length ?? 0) > 12;

  return (
    <WidgetCard
      title={t("dashboard.monthly.title")}
      extra={
        <Segmented<NewCustomersPeriod>
          size="small"
          value={period}
          onChange={setPeriod}
          options={PERIODS.map((item) => ({
            value: item.value,
            label: t(`dashboard.monthly.period.${item.label}`),
          }))}
        />
      }
    >
      {query.error && !data ? (
        <Alert type="error" showIcon title={getErrorMessage(query.error)} />
      ) : !data ? (
        <Skeleton active paragraph={{ rows: 5 }} />
      ) : (
        <>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold tracking-tight tabular-nums">
              {formatNumber(data.total)}
            </span>
            <span className="text-sm font-semibold text-slate-500">
              {t("dashboard.monthly.unit")}
            </span>
          </div>

          <div className="mt-3">
            <LineChart
              width={1040}
              height={240}
              labels={data.months.map(
                (m) =>
                  dayjs(m.month).format(long ? "MMM YY" : "MMM") + (isCurrent(m.month) ? "*" : ""),
              )}
              labelEvery={Math.max(1, Math.ceil(data.months.length / 12))}
              series={lines}
              renderTooltip={(index) => {
                const month = data.months[index];
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

          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 border-t border-slate-100 pt-3 text-xs text-slate-600">
            {lines.map((line) => (
              <span key={line.key} className="flex items-center gap-1.5">
                <span className="size-2.5 rounded-full" style={{ background: line.color }} />
                {line.name} ·{" "}
                {formatNumber(line.key === "total" ? data.total : data[line.key as "app" | "site"])}
              </span>
            ))}
            <span className="ml-auto text-slate-400">* {t("dashboard.stages.partial")}</span>
          </div>
        </>
      )}
    </WidgetCard>
  );
}
