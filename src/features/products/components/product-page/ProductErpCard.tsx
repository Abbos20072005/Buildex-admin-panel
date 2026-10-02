import { Card, Descriptions, type DescriptionsProps } from "antd";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { formatDateTime, formatNumber } from "@/shared/lib/format";
import type { ProductDetail } from "../../model/types";
import { ErpMark, ProductStock } from "../ProductBits";

const dash = (value: ReactNode) =>
  value === null || value === undefined || value === "" ? "—" : value;

/** "45.000" → "45", "0.800" → "0.8" */
const decimal = (value: string | null) => (value ? String(Number(value)) : null);

/** Values synced from 1C — read only. */
export function ProductErpCard({ product }: { product: ProductDetail }) {
  const { t } = useTranslation();
  const hasDiscount = product.discountPrice != null && product.discountPrice < product.price;
  const dims = [product.length, product.width, product.height].map(decimal).filter(Boolean);

  const items: DescriptionsProps["items"] = [
    {
      key: "code",
      label: "SKU",
      children: <span className="font-mono">{dash(product.code)}</span>,
    },
    {
      key: "articul",
      label: t("products.fields.articul"),
      children: <span className="font-mono">{dash(product.articul)}</span>,
    },
    {
      key: "barcode",
      label: t("products.fields.barcode"),
      children: <span className="font-mono">{dash(product.barcode)}</span>,
    },
    { key: "unit", label: t("products.fields.unit"), children: t(`unit.${product.unit}`) },
    {
      key: "price",
      label: t("products.fields.price"),
      children: <b className="tabular-nums">{formatNumber(product.price)}</b>,
    },
    {
      key: "discountPrice",
      label: t("products.fields.discountPrice"),
      children: hasDiscount ? (
        <b className="text-green-700 tabular-nums">
          {formatNumber(product.discountPrice as number)}
          {product.discount ? ` (−${product.discount}%)` : ""}
        </b>
      ) : (
        "—"
      ),
    },
    {
      key: "quantity",
      label: t("products.columns.stock"),
      children: <ProductStock product={product} />,
    },
    {
      key: "erp",
      label: t("products.fields.erpActive"),
      children: product.erpActive ? t("common.yes") : t("common.no"),
    },
    {
      key: "weight",
      label: t("products.fields.weight"),
      children: product.weight ? `${decimal(product.weight)} kg` : "—",
    },
    {
      key: "dims",
      label: t("products.fields.dimensions"),
      children: dims.length ? `${dims.join(" × ")} m` : "—",
    },
    {
      key: "created",
      label: t("products.fields.created"),
      children: formatDateTime(product.createdAt),
    },
    {
      key: "updated",
      label: t("products.fields.updated"),
      children: formatDateTime(product.updatedAt),
    },
  ];

  return (
    <Card title={t("products.modal.erp")} extra={<ErpMark />}>
      <Descriptions column={1} size="small" items={items} colon={false} className="info-list" />
    </Card>
  );
}
