import type { TFunction } from "i18next";
import dayjs from "dayjs";
import { downloadCsv } from "@/shared/lib/download";
import type { SalesAnalytics } from "../model/types";

/** The numbers of the page as one CSV (the API has no export endpoint). */
export function exportSalesCsv(data: SalesAnalytics, t: TFunction) {
  const section = (key: string) => t(`analytics.export.${key}`);
  const share = (name: string, items: SalesAnalytics["channels"], label: (key: string) => string) =>
    items.map((item) => [name, label(item.key), item.revenue, item.revenuePercent, item.orders]);

  const rows: (string | number | null)[][] = [
    [
      section("summary"),
      t("analytics.kpi.revenue"),
      data.summary.revenue.value,
      data.summary.revenue.change,
      "",
    ],
    [
      section("summary"),
      t("analytics.kpi.orders"),
      data.summary.orders.value,
      data.summary.orders.change,
      "",
    ],
    [
      section("summary"),
      t("analytics.kpi.averageCheck"),
      data.summary.averageCheck.value,
      data.summary.averageCheck.change,
      "",
    ],
    [
      section("summary"),
      t("analytics.kpi.cancelRate"),
      data.summary.cancelRate.value,
      data.summary.cancelRate.change,
      "",
    ],
    [
      section("summary"),
      t("analytics.kpi.refundRate"),
      data.summary.refundRate.value,
      data.summary.refundRate.change,
      "",
    ],
    [
      section("summary"),
      t("analytics.kpi.repeatRate"),
      data.summary.repeatRate.value,
      data.summary.repeatRate.change,
      "",
    ],
    ...data.chart.map((point) => [
      section("days"),
      point.date,
      point.revenue,
      point.previousRevenue,
      point.orders,
    ]),
    ...share(section("channels"), data.channels, (key) => t(`analytics.channels.${key}`)),
    ...data.categories.map((item) => [
      section("categories"),
      item.name,
      item.revenue,
      item.percent,
      "",
    ]),
    ...share(section("payments"), data.paymentMethods, (key) => t(`analytics.payments.${key}`)),
    ...share(section("delivery"), data.deliveryTypes, (key) => t(`analytics.delivery.${key}`)),
    ...data.topProducts.map((item) => [
      section("top"),
      item.product.name,
      item.revenue,
      item.change,
      item.quantity,
    ]),
    ...data.refundedProducts.map((item) => [
      section("refunded"),
      item.product.name,
      "",
      item.orders,
      item.quantity,
    ]),
  ];

  downloadCsv(
    `sales-${data.summary.dateFrom}_${data.summary.dateTo}-${dayjs().format("HHmm")}.csv`,
    [section("section"), section("name"), section("value"), section("share"), section("count")],
    rows,
  );
}
