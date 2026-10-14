import { Card } from "antd";
import { useTranslation } from "react-i18next";
import { compactMoney } from "@/features/dashboard";
import { formatNumber } from "@/shared/lib/format";
import type { SalesAnalytics, Share } from "../model/types";
import { CohortsCard } from "./CohortsCard";
import { KpiRow } from "./KpiRow";
import { RefundedProductsTable, TopProductsTable } from "./ProductTables";
import { RevenueChart } from "./RevenueChart";
import { ShareBars, type ShareRow } from "./ShareBars";

/** All widgets of Tahlil → Savdo in their grid. */
export function SalesView({ data, compare }: { data: SalesAnalytics; compare: boolean }) {
  const { t } = useTranslation();
  const money = (value: number) => {
    const { amount, unit } = compactMoney(value, t);
    return `${amount} ${unit}`.trim();
  };

  // the zero rows are noise in a share list ("other" is shown only when it has orders)
  const byRevenue = (items: Share[], label: (key: string) => string): ShareRow[] =>
    items
      .filter((item) => item.revenue > 0 || item.key !== "other")
      .map((item) => ({
        key: item.key,
        label: label(item.key),
        percent: item.revenuePercent,
        value: money(item.revenue),
      }));

  return (
    <div className="flex flex-col gap-4">
      <KpiRow summary={data.summary} compare={compare} />

      <div className="grid gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <Card
          title={<span className="text-base font-bold">{t("analytics.chart.title")}</span>}
          extra={<span className="text-xs text-slate-500">{t("analytics.chart.byDay")}</span>}
        >
          <RevenueChart points={data.chart} compare={compare} />
          <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 border-t border-slate-100 pt-3 text-xs text-slate-600">
            <span className="flex items-center gap-1.5">
              <span className="h-0.5 w-4 bg-brand" />
              {t("analytics.chart.revenueLegend")}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-0.5 w-4 bg-brand/45" />
              {t("analytics.chart.ordersLegend")}
            </span>
            {compare && (
              <span className="flex items-center gap-1.5">
                <span className="w-4 border-t-2 border-dashed border-slate-400" />
                {t("analytics.chart.previousLegend")}
              </span>
            )}
          </div>
        </Card>

        <ShareBars
          title={t("analytics.channels.title")}
          subtitle={t("analytics.revenueShare")}
          rows={byRevenue(data.channels, (key) => t(`analytics.channels.${key}`))}
          barClass="bg-brand"
          empty={t("common.noData")}
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <ShareBars
          title={t("analytics.categories.title")}
          subtitle={t("analytics.categories.subtitle")}
          rows={data.categories.map((item) => ({
            key: item.id,
            label: item.name,
            percent: item.percent,
            value: money(item.revenue),
          }))}
          barClass="bg-blue-500"
          empty={t("common.noData")}
        />

        <div className="flex flex-col gap-4">
          <ShareBars
            title={t("analytics.payments.title")}
            subtitle={t("analytics.revenueShare")}
            rows={byRevenue(data.paymentMethods, (key) => t(`analytics.payments.${key}`))}
            barClass="bg-green-700"
            empty={t("common.noData")}
          />
          <ShareBars
            title={t("analytics.delivery.title")}
            subtitle={t("analytics.delivery.subtitle")}
            rows={data.deliveryTypes.map((item) => ({
              key: item.key,
              label: t(`analytics.delivery.${item.key}`),
              percent: item.ordersPercent,
              value: `${formatNumber(item.orders)} ${t("analytics.ordersUnit")}`,
            }))}
            barClass="bg-brand-yellow"
            empty={t("common.noData")}
          />
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <TopProductsTable items={data.topProducts} compare={compare} />
        <RefundedProductsTable items={data.refundedProducts} />
      </div>

      <CohortsCard cohorts={data.cohorts} />
    </div>
  );
}
