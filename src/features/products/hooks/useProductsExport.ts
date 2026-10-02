import { App } from "antd";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { getErrorMessage } from "@/shared/api";
import { downloadCsv } from "@/shared/lib/download";
import { productsApi } from "../api/products.api";
import type { ProductFilters } from "../model/types";

/** Loads every product matching the filters and downloads them as CSV, reporting progress. */
export function useProductsExport() {
  const { t, i18n } = useTranslation();
  const { message } = App.useApp();
  const [progress, setProgress] = useState<{ loaded: number; total: number } | null>(null);

  const run = async (filters: ProductFilters) => {
    setProgress({ loaded: 0, total: 0 });
    try {
      const products = await productsApi.listAll(filters, i18n.language, (loaded, total) =>
        setProgress({ loaded, total }),
      );
      downloadCsv(
        `products-${new Date().toISOString().slice(0, 10)}.csv`,
        [
          "ID",
          t("products.columns.name"),
          "SKU",
          t("products.fields.articul"),
          t("products.fields.barcode"),
          t("products.fields.category"),
          t("products.fields.brand"),
          t("products.fields.price"),
          t("products.fields.discountPrice"),
          t("products.columns.stock"),
          t("products.fields.unit"),
          t("products.columns.status"),
          t("products.fields.isActive"),
        ],
        products.map((product) => [
          product.id,
          product.name,
          product.code,
          product.articul,
          product.barcode,
          product.category?.name,
          product.brand?.name,
          product.price,
          product.discountPrice,
          product.quantity,
          t(`unit.${product.unit}`),
          t(`publishStatus.${product.publishStatus}`),
          product.isActive ? "+" : "−",
        ]),
      );
      message.success(t("products.toast.exported", { count: products.length }));
    } catch (error) {
      message.error(getErrorMessage(error, t("products.toast.loadError")));
    } finally {
      setProgress(null);
    }
  };

  return { run, progress };
}
