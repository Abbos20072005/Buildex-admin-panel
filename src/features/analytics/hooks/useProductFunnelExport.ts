import { App } from "antd";
import dayjs from "dayjs";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { getErrorMessage } from "@/shared/api";
import { downloadBlob } from "@/shared/lib/download";
import { productFunnelApi, type FunnelFilters } from "../api/productFunnel.api";

/** Downloads the funnel table as an XLSX: the filters on the screen, every row. */
export function useProductFunnelExport() {
  const { t } = useTranslation();
  const { message } = App.useApp();
  const [loading, setLoading] = useState(false);

  const run = async (filters: FunnelFilters, language: string) => {
    setLoading(true);
    try {
      const { blob, filename } = await productFunnelApi.exportXlsx(filters, language);
      downloadBlob(filename ?? `product_funnel_${dayjs().format("YYYYMMDD_HHmm")}.xlsx`, blob);
    } catch (error) {
      message.error(getErrorMessage(error) || t("funnel.exportError"));
    } finally {
      setLoading(false);
    }
  };

  return { loading, run };
}
