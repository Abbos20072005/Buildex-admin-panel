import { Tag, type TableColumnsType } from "antd";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { formatDate } from "@/shared/lib/format";
import type { Product, ProductSort } from "../../model/types";
import {
  ErpMark,
  ProductPrice,
  ProductStock,
  ProductThumb,
  PublishStatusTag,
} from "../ProductBits";

const sortOrder = (sort: ProductSort, field: string) =>
  sort === field ? "ascend" : sort === `-${field}` ? "descend" : null;

export function useProductColumns(sort: ProductSort): TableColumnsType<Product> {
  const { t } = useTranslation();

  return useMemo(
    () => [
      {
        key: "thumb",
        width: 72,
        render: (_, product) => (
          <ProductThumb src={product.image} alt={product.name} className="size-11" />
        ),
      },
      {
        key: "name",
        title: t("products.columns.name"),
        sorter: true,
        sortOrder: sortOrder(sort, "name"),
        render: (_, product) => (
          <div className="max-w-80 min-w-48 leading-tight">
            <div className="line-clamp-2 font-semibold">{product.name}</div>
            <div className="mt-0.5 font-mono text-xs text-slate-400">
              {product.code ?? product.articul ?? `ID ${product.id}`}
            </div>
          </div>
        ),
      },
      {
        key: "category",
        title: t("products.columns.category"),
        render: (_, product) => (
          <div className="max-w-56 leading-tight">
            <div className="truncate">{product.category?.name ?? "—"}</div>
            <div className="truncate text-xs text-slate-400">{product.brand?.name ?? "—"}</div>
          </div>
        ),
      },
      {
        key: "price",
        title: (
          <span className="inline-flex items-center gap-1.5">
            {t("products.columns.price")} <ErpMark />
          </span>
        ),
        align: "right",
        sorter: true,
        sortOrder: sortOrder(sort, "price"),
        render: (_, product) => <ProductPrice product={product} />,
      },
      {
        key: "quantity",
        title: (
          <span className="inline-flex items-center gap-1.5">
            {t("products.columns.stock")} <ErpMark />
          </span>
        ),
        align: "right",
        sorter: true,
        sortOrder: sortOrder(sort, "quantity"),
        render: (_, product) => <ProductStock product={product} />,
      },
      {
        key: "status",
        title: t("products.columns.status"),
        render: (_, product) => (
          <div className="flex flex-col items-start gap-1">
            <PublishStatusTag status={product.publishStatus} />
            {!product.isActive && (
              <Tag variant="filled" className="m-0">
                {t("products.inactive")}
              </Tag>
            )}
            {product.badge && (
              <Tag color="blue" variant="outlined" className="m-0">
                {product.badge.name}
              </Tag>
            )}
          </div>
        ),
      },
      {
        key: "created_at",
        title: t("products.columns.created"),
        dataIndex: "createdAt",
        width: 120,
        sorter: true,
        sortOrder: sortOrder(sort, "created_at"),
        render: (iso: string) => <span className="text-slate-500">{formatDate(iso)}</span>,
      },
    ],
    [t, sort],
  );
}
