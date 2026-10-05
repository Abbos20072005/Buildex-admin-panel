import { Tag, type TableColumnsType } from "antd";
import type { TFunction } from "i18next";
import { formatDateTime, formatMoney, formatNumber, formatPhone } from "@/shared/lib/format";
import { InitialsAvatar } from "@/shared/ui";
import type { Customer } from "../model/types";

const dash = <span className="text-slate-400">—</span>;

/** The state tag of a customer: blocked wins, then an unconfirmed phone. */
function stateTag(item: Customer, t: TFunction) {
  const [color, key] = item.isBlocked
    ? ["red", "blocked"]
    : !item.verified
      ? ["gold", "unverified"]
      : ["green", "verified"];
  return (
    <Tag color={color} variant="filled" className="m-0 font-semibold">
      {t(`customers.state.${key}`)}
    </Tag>
  );
}

/** Mijoz · Telefon · Rol · Holat · Buyurtmalar · Xaridlar · Oxirgi kirish · Ro'yxatdan o'tgan. */
export const customerColumns = (t: TFunction): TableColumnsType<Customer> => [
  {
    key: "customer",
    title: t("customers.columns.customer"),
    width: 280,
    render: (_, item) => (
      <div className="flex items-center gap-3">
        <InitialsAvatar name={item.fullName || item.phone} src={item.avatar} />
        <div className="min-w-0">
          <div className="truncate font-bold">{item.fullName || dash}</div>
          <div className="truncate text-xs text-slate-500">{item.email || `ID ${item.id}`}</div>
        </div>
      </div>
    ),
  },
  {
    key: "phone",
    title: t("customers.columns.phone"),
    width: 170,
    render: (_, item) => <span className="font-mono text-xs">{formatPhone(item.phone)}</span>,
  },
  {
    key: "role",
    title: t("customers.columns.role"),
    width: 120,
    render: (_, item) => (
      <Tag
        color={item.role === "prorab" ? "blue" : "default"}
        variant="filled"
        className="m-0 font-semibold"
      >
        {t(`role.${item.role}`)}
      </Tag>
    ),
  },
  {
    key: "state",
    title: t("customers.columns.state"),
    width: 150,
    render: (_, item) => stateTag(item, t),
  },
  {
    key: "orders",
    title: t("customers.columns.orders"),
    width: 110,
    align: "right",
    render: (_, item) => (item.ordersCount ? formatNumber(item.ordersCount) : dash),
  },
  {
    key: "purchase",
    title: t("customers.columns.purchase"),
    width: 170,
    align: "right",
    render: (_, item) =>
      item.totalPurchase ? formatMoney(item.totalPurchase, t("common.sum")) : dash,
  },
  {
    key: "lastLogin",
    title: t("customers.columns.lastLogin"),
    width: 170,
    render: (_, item) => (item.lastLogin ? formatDateTime(item.lastLogin) : dash),
  },
  {
    key: "created",
    title: t("customers.columns.created"),
    width: 170,
    render: (_, item) => formatDateTime(item.createdAt),
  },
];
