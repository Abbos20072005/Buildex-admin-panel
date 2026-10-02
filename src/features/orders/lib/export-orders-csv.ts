import type { TFunction } from "i18next";
import { downloadCsv } from "@/shared/lib/download";
import { formatDateTime, formatPhone } from "@/shared/lib/format";
import type { Order } from "../model/types";

export function exportOrdersCsv(orders: Order[], t: TFunction) {
  const header = [
    t("orders.columns.id"),
    t("orders.columns.date"),
    t("orders.columns.customer"),
    t("orders.columns.phone"),
    t("orders.columns.fulfillment"),
    t("orders.columns.items"),
    t("orders.columns.amount"),
    t("orders.columns.payment"),
    t("orders.columns.payStatus"),
    t("orders.columns.status"),
  ];

  const rows = orders.map((order) => [
    order.id,
    formatDateTime(order.createdAt),
    order.customer.name,
    formatPhone(order.customer.phone),
    t(`fulfillment.${order.fulfillment}`),
    order.itemsCount,
    order.total,
    order.payType ? t(`payType.${order.payType}`) : "",
    t(`payStatus.${order.payStatus}`),
    t(`status.${order.status}`),
  ]);

  downloadCsv(`buildex-orders-${new Date().toISOString().slice(0, 10)}.csv`, header, rows);
}
