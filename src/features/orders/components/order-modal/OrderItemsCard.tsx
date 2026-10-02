import { InboxOutlined } from "@ant-design/icons";
import { Card, Table, type TableColumnsType } from "antd";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { formatDate, formatNumber } from "@/shared/lib/format";
import type { OrderDetail, OrderItem } from "../../model/types";

const unitPrice = (item: OrderItem) => item.discountPrice ?? item.price;

function useItemColumns(): TableColumnsType<OrderItem> {
  const { t } = useTranslation();
  return [
    {
      key: "thumb",
      width: 64,
      render: () => (
        <span className="grid size-10 place-items-center rounded-lg border border-slate-200 bg-slate-50 text-slate-400">
          <InboxOutlined />
        </span>
      ),
    },
    {
      key: "product",
      title: t("orders.modal.product"),
      render: (_, item) => (
        <div>
          <div className="font-medium">{item.name}</div>
          {item.code && <div className="font-mono text-xs text-slate-400">{item.code}</div>}
        </div>
      ),
    },
    { key: "qty", title: t("orders.modal.qty"), dataIndex: "qty", align: "right", width: 80 },
    {
      key: "price",
      title: t("orders.modal.price"),
      align: "right",
      width: 130,
      render: (_, item) => (
        <div className="tabular-nums">
          {formatNumber(unitPrice(item))}
          {item.discountPrice != null && item.discountPrice < item.price && (
            <div className="text-xs text-slate-400 line-through">{formatNumber(item.price)}</div>
          )}
        </div>
      ),
    },
    {
      key: "total",
      title: t("orders.modal.lineTotal"),
      align: "right",
      width: 140,
      render: (_, item) => (
        <b className="tabular-nums">{formatNumber(item.qty * unitPrice(item))}</b>
      ),
    },
  ];
}

function TotalsRow({ label, value, tone }: { label: ReactNode; value: ReactNode; tone?: "green" }) {
  const color = tone === "green" ? "text-green-700" : "";
  return (
    <>
      <dt className={`text-slate-500 ${color}`}>{label}</dt>
      <dd className={`m-0 ps-8 text-right tabular-nums ${color}`}>{value}</dd>
    </>
  );
}

export function OrderItemsCard({ order }: { order: OrderDetail }) {
  const { t } = useTranslation();
  const columns = useItemColumns();
  const itemsSum = order.items.reduce((sum, item) => sum + item.qty * unitPrice(item), 0);
  const promo = order.promocode;

  return (
    <Card
      title={
        <>
          {t("orders.modal.composition")}{" "}
          <span className="font-normal text-slate-400">
            · {t("orders.modal.positions", { count: order.items.length })}
          </span>
        </>
      }
      styles={{ body: { padding: 0 } }}
    >
      <Table<OrderItem>
        rowKey="id"
        size="small"
        columns={columns}
        dataSource={order.items}
        pagination={false}
        scroll={{ x: 560 }}
        locale={{ emptyText: t("orders.modal.noItems") }}
      />

      <dl className="m-0 ml-auto grid max-w-md grid-cols-[1fr_auto] gap-y-2 px-5 pt-4 pb-5 text-sm">
        <TotalsRow
          label={t("orders.modal.subtotal")}
          value={formatNumber(order.subtotal || itemsSum)}
        />
        <TotalsRow
          label={t("orders.modal.delivery")}
          value={order.deliveryCost ? formatNumber(order.deliveryCost) : t("orders.modal.free")}
        />
        {order.saved > 0 && (
          <TotalsRow
            tone="green"
            label={t("orders.modal.discount")}
            value={`−${formatNumber(order.saved)}`}
          />
        )}
        {promo && (
          <TotalsRow
            tone="green"
            label={
              <>
                {t("orders.modal.promocode")} <span className="font-mono">{promo.code}</span>
                {promo.name && <span className="text-slate-400"> · {promo.name}</span>}
                {promo.expiresAt && (
                  <div className="text-xs text-slate-400">
                    {t("orders.modal.validUntil", { date: formatDate(promo.expiresAt) })}
                  </div>
                )}
              </>
            }
            value={
              promo.percent
                ? `−${promo.percent}%`
                : promo.amount
                  ? `−${formatNumber(promo.amount)}`
                  : "—"
            }
          />
        )}
        <dt className="mt-1 border-t border-slate-200 pt-3 text-base font-bold">
          {t("orders.modal.total")}
        </dt>
        <dd className="m-0 mt-1 border-t border-slate-200 ps-8 pt-3 text-right text-lg font-bold tabular-nums">
          {formatNumber(order.total)} <small className="text-xs text-slate-400">UZS</small>
        </dd>
      </dl>
    </Card>
  );
}
