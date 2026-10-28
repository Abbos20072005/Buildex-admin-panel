import { App } from "antd";
import dayjs from "dayjs";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { getErrorMessage } from "@/shared/api";
import { downloadBlob } from "@/shared/lib/download";
import { productsApi } from "../api/products.api";
import type { ProductFilters } from "../model/types";

/** Downloads the uz / ru texts of the filtered products as an XLSX (to check the translations). */
export function useProductsTextsExport() {
  const { t } = useTranslation();
  const { message } = App.useApp();
  const [loading, setLoading] = useState(false);

  const run = async (filters: ProductFilters, rawHtml: boolean) => {
    setLoading(true);
    // building the file for the whole catalog takes several seconds
    message.loading({ content: t("products.exportMenu.textsPreparing"), key: "texts-export" });
    try {
      const { blob, filename } = await productsApi.exportTexts(filters, rawHtml);
      downloadBlob(filename ?? `products_i18n_${dayjs().format("YYYYMMDD_HHmm")}.xlsx`, blob);
      message.success({ content: t("products.exportMenu.textsDone"), key: "texts-export" });
    } catch (error) {
      message.error({ content: getErrorMessage(error), key: "texts-export" });
    } finally {
      setLoading(false);
    }
  };

  return { loading, run };
}
