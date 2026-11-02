import { Alert, Segmented, Skeleton } from "antd";
import dayjs from "dayjs";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Change, LineChart, weekdayLabel } from "@/features/dashboard";
import { getErrorMessage } from "@/shared/api";
import { formatNumber } from "@/shared/lib/format";
import { WidgetCard } from "@/shared/ui";
import { brand } from "@/theme";
import { useSalesAnalyticsQuery } from "../hooks/queries";

/** Spans of the card and their length in days. */
const SPANS = { week: 7, month: 30, quarter: 90 } as const;
type Span = keyof typeof SPANS;

/** Orders that came in (placed) per day: its own span, apart from the delivered-orders card. */
export function ReceivedOrdersCard() {
  const { t } = useTranslation();
  const [span, setSpan] = useState<Span>("week");
  const query = useSalesAnalyticsQuery({ period: { kind: "days", days: SPANS[span] } });
  const data = query.data;

  const labels = (data?.chart ?? []).map((point) =>
    span === "week"
      ? weekdayLabel(point.date, t)
      : dayjs(point.date).format(span === "month" ? "D" : "D MMM"),
  );

  return (
    <WidgetCard
      title={t("dashboard.received.title")}
      extra={
        <Segmented<Span>
          size="small"
          value={span}
          onChange={setSpan}
          options={(Object.keys(SPANS) as Span[]).map((value) => ({
            value,
            label: t(`dashboard.period.${value}`),
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
              {formatNumber(data.summary.orders.value)}
            </span>
            <span className="text-sm font-semibold text-slate-500">
              {t("dashboard.received.unit")}
            </span>
            <Change value={data.summary.orders.change} />
          </div>

          <div className="mt-3">
            <LineChart
              width={1040}
              height={240}
              labels={labels}
              labelEvery={span === "week" ? 1 : span === "month" ? 5 : 10}
              series={[
                {
                  key: "orders",
                  name: t("dashboard.received.orders"),
                  color: brand.primary,
                  values: data.chart.map((point) => point.orders),
                },
              ]}
            />
          </div>
        </>
      )}
    </WidgetCard>
  );
}
