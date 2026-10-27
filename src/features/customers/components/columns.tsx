import { Tag, type TableColumnsType } from "antd";
import type { TFunction } from "i18next";
import { useTranslation } from "react-i18next";
import { formatDate, formatNumber, maskPhone } from "@/shared/lib/format";
import { InitialsAvatar } from "@/shared/ui";
import { CUSTOMER_API } from "../model/capabilities";
import type { Customer } from "../model/types";

const dash = <span className="text-slate-400">—</span>;

const STATE_COLOR = { deleted: "default", blocked: "red", unverified: "gold", active: "green" };

/** The state tag of a customer: deleted and blocked win, then an unconfirmed phone. */
export function CustomerStateTag({ item }: { item: Customer }) {
  const { t } = useTranslation();
  const key = item.isDeleted
    ? "deleted"
    : item.isBlocked
      ? "blocked"
      : !item.verified
        ? "unverified"
        : "active";
  return (
    <Tag color={STATE_COLOR[key]} variant="filled" className="m-0 font-semibold">
      {t(`customers.state.${key}`)}
    </Tag>
  );
}

/** "Kanal" cell: the site or an app. */
export const channelLabel = (channel: Customer["channel"], t: TFunction) =>
  channel ? t(`customers.channel.${channel}`) : soon(t);

/** A cell whose data the backend does not send yet. */
const soon = (t: TFunction) => (
  <span className="text-xs text-slate-400" title={t("customers.soon")}>
    {t("customers.soonShort")}
  </span>
);

/** Mijoz · Telefon · Kanal · Ro'yxatdan o'tgan · Buyurtmalar · Jami xarid · Oxirgi buyurtma · Holat. */
export const customerColumns = (t: TFunction): TableColumnsType<Customer> => [
  {
    key: "customer",
    title: t("customers.columns.customer"),
    width: 240,
    render: (_, item) => (
      <div className="flex items-center gap-3">
        <InitialsAvatar name={item.fullName || item.phone} src={item.avatar} size={32} />
        <div className="min-w-0">
          <div className="truncate font-semibold">{item.fullName || dash}</div>
          <div className="truncate font-mono text-[11px] text-slate-500">
            ID {formatNumber(item.id)}
          </div>
        </div>
      </div>
    ),
  },
  {
    key: "phone",
    title: t("customers.columns.phone"),
    width: 170,
    render: (_, item) => <span className="font-mono text-xs">{maskPhone(item.phone)}</span>,
  },
  {
    key: "channel",
    title: t("customers.columns.channel"),
    width: 100,
    render: (_, item) => channelLabel(item.channel, t),
  },
  {
    key: "created",
    title: t("customers.columns.created"),
    width: 150,
    render: (_, item) => formatDate(item.createdAt),
  },
  {
    key: "orders",
    title: t("customers.columns.orders"),
    width: 120,
    align: "right",
    render: (_, item) => (item.ordersCount ? formatNumber(item.ordersCount) : dash),
  },
  {
    key: "purchase",
    title: t("customers.columns.purchase"),
    width: 160,
    align: "right",
    render: (_, item) =>
      item.totalPurchase ? (
        <span className="font-semibold tabular-nums">{formatNumber(item.totalPurchase)}</span>
      ) : (
        dash
      ),
  },
  {
    key: "lastOrder",
    title: t("customers.columns.lastOrder"),
    width: 150,
    render: (_, item) =>
      item.lastOrderAt ? formatDate(item.lastOrderAt) : CUSTOMER_API.rangeFilters ? dash : soon(t),
  },
  {
    key: "state",
    title: t("customers.columns.state"),
    width: 140,
    render: (_, item) => <CustomerStateTag item={item} />,
  },
];
