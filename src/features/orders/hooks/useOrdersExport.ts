import { App } from "antd";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { getErrorMessage } from "@/shared/api";
import { ordersApi } from "../api/orders.api";
import { exportOrdersCsv } from "../lib/export-orders-csv";
import type { OrderFilters } from "../model/types";

/** Loads every order matching the filters and downloads them as CSV, reporting progress. */
export function useOrdersExport() {
  const { t } = useTranslation();
  const { message } = App.useApp();
  const [progress, setProgress] = useState<{ loaded: number; total: number } | null>(null);

  const run = async (filters: OrderFilters) => {
    setProgress({ loaded: 0, total: 0 });
    try {
      const orders = await ordersApi.listAll(filters, (loaded, total) =>
        setProgress({ loaded, total }),
      );
      exportOrdersCsv(orders, t);
      message.success(t("orders.toast.exported", { count: orders.length }));
    } catch (error) {
      message.error(getErrorMessage(error, t("orders.toast.loadError")));
    } finally {
      setProgress(null);
    }
  };

  return { run, progress, isExporting: progress !== null };
}
