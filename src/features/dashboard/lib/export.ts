import type { TFunction } from "i18next";
import dayjs from "dayjs";
import { downloadCsv } from "@/shared/lib/download";
import type { Dashboard } from "../model/types";

/** The numbers on the screen as a CSV: KPIs, daily delivered orders and monthly revenue. */
export function exportDashboardCsv(data: Dashboard, t: TFunction) {
  const { summary, delivered, revenue } = data;
  const rows: (string | number | null)[][] = [
    [t("dashboard.kpi.orders"), "", summary.orders.value, summary.orders.change],
    [t("dashboard.kpi.revenue"), "", summary.revenue.value, summary.revenue.change],
    [t("dashboard.kpi.averageCheck"), "", summary.averageCheck.value, summary.averageCheck.change],
    [t("dashboard.kpi.newCustomers"), "", summary.newCustomers.value, summary.newCustomers.change],
    ...delivered.points.map((point) => [
      t("dashboard.delivered.title"),
      point.date,
      point.revenue,
      point.count,
    ]),
    ...revenue.months.map((month) => [
      t("dashboard.revenue.title"),
      month.month,
      month.b2b,
      month.individual,
    ]),
  ];
  downloadCsv(
    `dashboard-${dayjs().format("YYYY-MM-DD")}.csv`,
    [
      t("dashboard.export.section"),
      t("dashboard.export.date"),
      t("dashboard.export.value"),
      t("dashboard.export.extra"),
    ],
    rows,
  );
}
