import { Card, Table, type TableColumnsType } from "antd";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { percent } from "@/features/dashboard";
import { clsx } from "@/shared/lib/clsx";
import { formatNumber } from "@/shared/lib/format";
import type { RefundedProduct, TopProduct } from "../model/types";

const sku = (product: { productCode: string | null; articulCode: string | null }) =>
  product.articulCode || product.productCode;

/** "Eng ko'p sotilgan mahsulotlar": quantity, revenue and the change against the previous period. */
export function TopProductsTable({ items, compare }: { items: TopProduct[]; compare: boolean }) {
  const { t } = useTranslation();
  const columns: TableColumnsType<TopProduct> = [
    {
      key: "product",
      title: t("analytics.products.product"),
      render: (_, item) => (
        <Link to={`/products/${item.product.id}`} className="font-medium text-slate-900">
          {item.product.name}
        </Link>
      ),
    },
    {
      key: "sku",
      title: t("analytics.products.sku"),
      width: 200,
      render: (_, item) => {
        const code = sku(item.product);
        return code ? <code className="font-mono text-xs text-brand">{code}</code> : "—";
      },
    },
    {
      key: "quantity",
      title: t("analytics.products.quantity"),
      width: 90,
      align: "right",
      render: (_, item) => <span className="tabular-nums">{formatNumber(item.quantity)}</span>,
    },
    {
      key: "revenue",
      title: t("analytics.products.revenue"),
      width: 150,
      align: "right",
      render: (_, item) => <span className="tabular-nums">{formatNumber(item.revenue)}</span>,
    },
    ...(compare
      ? [
          {
            key: "change",
            title: t("analytics.products.change"),
            width: 110,
            align: "right" as const,
            render: (_: unknown, item: TopProduct) =>
              item.change === null ? (
                <span className="text-slate-400">—</span>
              ) : (
                <b
                  className={clsx("text-xs", item.change >= 0 ? "text-green-700" : "text-red-600")}
                >
                  {item.change >= 0 ? "▲" : "▼"} {percent(item.change)}
                </b>
              ),
          },
        ]
      : []),
  ];

  return (
    <Card
      title={<span className="text-base font-bold">{t("analytics.products.topTitle")}</span>}
      styles={{ body: { padding: 0 } }}
    >
      <Table<TopProduct>
        rowKey={(item) => item.product.id}
        size="middle"
        columns={columns}
        dataSource={items}
        pagination={false}
        scroll={{ x: 640 }}
        locale={{ emptyText: <div className="py-8 text-slate-400">{t("common.noData")}</div> }}
      />
    </Card>
  );
}

/** "Eng ko'p qaytarilgan mahsulotlar": products of the orders whose money was refunded. */
export function RefundedProductsTable({ items }: { items: RefundedProduct[] }) {
  const { t } = useTranslation();
  const columns: TableColumnsType<RefundedProduct> = [
    {
      key: "product",
      title: t("analytics.products.product"),
      render: (_, item) => (
        <Link to={`/products/${item.product.id}`} className="font-medium text-slate-900">
          {item.product.name}
        </Link>
      ),
    },
    {
      key: "quantity",
      title: t("analytics.products.refunded"),
      width: 110,
      align: "right",
      render: (_, item) => <b className="tabular-nums">{formatNumber(item.quantity)}</b>,
    },
    {
      key: "orders",
      title: t("analytics.products.orders"),
      width: 110,
      align: "right",
      render: (_, item) => <span className="tabular-nums">{formatNumber(item.orders)}</span>,
    },
  ];

  return (
    <Card
      title={<span className="text-base font-bold">{t("analytics.products.refundedTitle")}</span>}
      extra={
        <Link to="/orders" className="text-sm font-semibold">
          {t("nav.orders")}
        </Link>
      }
      styles={{ body: { padding: 0 } }}
    >
      <Table<RefundedProduct>
        rowKey={(item) => item.product.id}
        size="middle"
        columns={columns}
        dataSource={items}
        pagination={false}
        locale={{ emptyText: <div className="py-8 text-slate-400">{t("common.noData")}</div> }}
      />
    </Card>
  );
}
