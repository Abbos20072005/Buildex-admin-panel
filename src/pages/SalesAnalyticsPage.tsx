import { DownloadIcon } from "@/shared/icons";
import { Alert, Button, DatePicker, Segmented, Select, Skeleton, Switch } from "antd";
import dayjs from "dayjs";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  exportSalesCsv,
  SalesView,
  useSalesAnalyticsQuery,
  type SalesChannel,
  type SalesPeriod,
  type SalesSegment,
} from "@/features/analytics";
import { getErrorMessage } from "@/shared/api";

/** Quick periods of the toolbar; "range" opens the date pickers. */
type PeriodKey = "today" | "7" | "30" | "month" | "range";

const DATE = "DD.MM.YYYY";

const PERIODS: Record<Exclude<PeriodKey, "range">, SalesPeriod> = {
  today: { kind: "days", days: 1 },
  "7": { kind: "days", days: 7 },
  "30": { kind: "days", days: 30 },
  month: { kind: "month" },
};

/** Tahlil → Savdo: revenue and orders for a period, by channel, category, payment and product. */
export function SalesAnalyticsPage() {
  const { t } = useTranslation();

  const [periodKey, setPeriodKey] = useState<PeriodKey>("30");
  const [range, setRange] = useState<[string, string] | null>(null);
  const [channel, setChannel] = useState<SalesChannel>();
  const [segment, setSegment] = useState<SalesSegment>();
  const [compare, setCompare] = useState(true);

  // a custom range without both dates yet falls back to the last 30 days
  const period: SalesPeriod =
    periodKey === "range" && range
      ? { kind: "range", from: range[0], to: range[1] }
      : PERIODS[periodKey === "range" ? "30" : periodKey];

  const query = useSalesAnalyticsQuery({ period, channel, segment });
  const data = query.data;

  const subtitle = data
    ? (() => {
        const from = dayjs(data.summary.dateFrom);
        const to = dayjs(data.summary.dateTo);
        const length = to.diff(from, "day") + 1;
        const previousTo = from.subtract(1, "day");
        const previousFrom = previousTo.subtract(length - 1, "day");
        return t("analytics.subtitle", {
          from: from.format(DATE),
          to: to.format(DATE),
          previousFrom: previousFrom.format(DATE),
          previousTo: previousTo.format(DATE),
        });
      })()
    : "";

  return (
    <>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-xs text-slate-500">{t("nav.analytics")}</div>
          <h1 className="m-0 text-2xl font-bold tracking-tight">{t("nav.sales")}</h1>
          <div className="mt-1 text-xs text-slate-500">{subtitle}</div>
        </div>
        <Button
          icon={<DownloadIcon />}
          disabled={!data}
          onClick={() => data && exportSalesCsv(data, t)}
        >
          {t("analytics.export.button")}
        </Button>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <Segmented<PeriodKey>
          value={periodKey}
          onChange={setPeriodKey}
          options={[
            { value: "today", label: t("analytics.periods.today") },
            { value: "7", label: t("analytics.periods.7") },
            { value: "30", label: t("analytics.periods.30") },
            { value: "month", label: t("analytics.periods.month") },
            { value: "range", label: t("analytics.periods.range") },
          ]}
        />
        {periodKey === "range" && (
          <DatePicker.RangePicker
            format={DATE}
            allowClear={false}
            disabledDate={(date, info) => {
              // at most 366 days between the two ends (the API refuses a longer range)
              const start = info.from;
              return !!start && Math.abs(date.diff(start, "day")) > 365;
            }}
            onChange={(dates) =>
              dates?.[0] &&
              dates[1] &&
              setRange([dates[0].format("YYYY-MM-DD"), dates[1].format("YYYY-MM-DD")])
            }
          />
        )}
        <Select<SalesChannel>
          allowClear
          className="w-44"
          placeholder={t("analytics.channelFilter", { value: t("common.all") })}
          value={channel}
          onChange={setChannel}
          options={(["site", "ios", "android"] as const).map((value) => ({
            value,
            label: t("analytics.channelFilter", { value: t(`analytics.channels.${value}`) }),
          }))}
        />
        <Select<SalesSegment>
          allowClear
          className="w-52"
          placeholder={t("analytics.segmentFilter", { value: t("common.all") })}
          value={segment}
          onChange={setSegment}
          options={(["b2b", "individual"] as const).map((value) => ({
            value,
            label: t("analytics.segmentFilter", { value: t(`analytics.segments.${value}`) }),
          }))}
        />
        <label className="ml-auto flex items-center gap-2 text-sm">
          <Switch checked={compare} onChange={setCompare} />
          {t("analytics.compare")}
        </label>
      </div>

      {query.error && !data ? (
        <Alert
          type="error"
          showIcon
          title={t("analytics.loadError")}
          description={getErrorMessage(query.error)}
          action={
            <Button size="small" onClick={() => void query.refetch()}>
              {t("common.retry")}
            </Button>
          }
        />
      ) : data ? (
        <SalesView data={data} compare={compare} />
      ) : (
        <Skeleton active paragraph={{ rows: 10 }} />
      )}
    </>
  );
}
