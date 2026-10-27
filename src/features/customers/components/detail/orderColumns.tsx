import type { TableColumnsType } from "antd";
import type { TFunction } from "i18next";
import { OrderStatusTag, type Order } from "@/features/orders";
import { formatDate, formatNumber, formatOrderId, formatTime } from "@/shared/lib/format";

const dash = <span className="text-slate-400">—</span>;

/** № · Sana · Kanal · Olish usuli · Poz. · Summa · To'lov · Holat — the orders of one customer. */
export const customerOrderColumns = (t: TFunction): TableColumnsType<Order> => [
  {
    key: "id",
    title: t("customers.orderColumns.number"),
    width: 100,
    render: (_, order) => (
      <span className="font-mono font-semibold text-brand">{formatOrderId(order.id)}</span>
    ),
  },
  {
    key: "date",
    title: t("customers.orderColumns.date"),
    width: 130,
    render: (_, order) => (
      <div>
        <div className="font-medium">{formatDate(order.createdAt)}</div>
        <div className="text-xs text-slate-500">{formatTime(order.createdAt)}</div>
      </div>
    ),
  },
  {
    key: "channel",
    title: t("customers.orderColumns.channel"),
    width: 90,
    render: (_, order) => (order.channel ? t(`customers.channel.${order.channel}`) : dash),
  },
  {
    key: "method",
    title: t("customers.orderColumns.method"),
    width: 130,
    render: (_, order) => t(`fulfillment.${order.fulfillment}`),
  },
  {
    key: "items",
    title: t("customers.orderColumns.items"),
    width: 80,
    align: "right",
    render: (_, order) => formatNumber(order.itemsCount),
  },
  {
    key: "total",
    title: t("customers.orderColumns.total"),
    width: 140,
    align: "right",
    render: (_, order) => (
      <span className="font-semibold tabular-nums">{formatNumber(order.total)}</span>
    ),
  },
  {
    key: "payment",
    title: t("customers.orderColumns.payment"),
    width: 150,
    render: (_, order) => (order.payType ? t(`payType.${order.payType}`) : dash),
  },
  {
    key: "status",
    title: t("customers.orderColumns.status"),
    width: 130,
    render: (_, order) => <OrderStatusTag status={order.status} />,
  },
];
