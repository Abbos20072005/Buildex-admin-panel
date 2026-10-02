import type { TableColumnsType } from "antd";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  formatDate,
  formatNumber,
  formatOrderId,
  formatPhone,
  formatTime,
} from "@/shared/lib/format";
import type { Order, OrderSort } from "../../model/types";
import { OrderStatusTag, PayStatusTag } from "../OrderTags";

const sortOrder = (sort: OrderSort, field: string) =>
  sort === field ? "ascend" : sort === `-${field}` ? "descend" : null;

export function useOrderColumns(sort: OrderSort): TableColumnsType<Order> {
  const { t } = useTranslation();

  return useMemo(
    () => [
      {
        key: "id",
        title: t("orders.columns.id"),
        dataIndex: "id",
        width: 110,
        render: (id: number) => (
          <span className="font-mono font-semibold text-brand">{formatOrderId(id)}</span>
        ),
      },
      {
        key: "created_at",
        title: t("orders.columns.date"),
        dataIndex: "createdAt",
        width: 130,
        sorter: true,
        sortOrder: sortOrder(sort, "created_at"),
        render: (iso: string) => (
          <div className="leading-tight">
            <div>{formatDate(iso)}</div>
            <div className="font-mono text-xs text-slate-500">{formatTime(iso)}</div>
          </div>
        ),
      },
      {
        key: "customer",
        title: t("orders.columns.customer"),
        render: (_, order) => (
          <div className="max-w-64 leading-tight">
            <div className="truncate font-medium">{order.customer.name}</div>
            <div className="font-mono text-xs text-slate-500">
              {formatPhone(order.customer.phone)}
            </div>
          </div>
        ),
      },
      {
        key: "fulfillment",
        title: t("orders.columns.fulfillment"),
        dataIndex: "fulfillment",
        render: (value: Order["fulfillment"]) => t(`fulfillment.${value}`),
      },
      {
        key: "items",
        title: t("orders.columns.items"),
        dataIndex: "itemsCount",
        align: "right",
        width: 70,
      },
      {
        key: "total_price",
        title: t("orders.columns.amount"),
        dataIndex: "total",
        align: "right",
        sorter: true,
        sortOrder: sortOrder(sort, "total_price"),
        render: (total: number) => (
          <span className="font-bold tabular-nums">{formatNumber(total)}</span>
        ),
      },
      {
        key: "payment",
        title: t("orders.columns.payment"),
        render: (_, order) => (
          <div className="flex flex-col items-start gap-1">
            <span className="text-xs text-slate-500">
              {order.payType ? t(`payType.${order.payType}`) : "—"}
            </span>
            <PayStatusTag status={order.payStatus} />
          </div>
        ),
      },
      {
        key: "status",
        title: t("orders.columns.status"),
        dataIndex: "status",
        render: (status: Order["status"]) => <OrderStatusTag status={status} />,
      },
    ],
    [t, sort],
  );
}
