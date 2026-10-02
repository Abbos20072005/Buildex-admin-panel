import { Tabs } from "antd";
import { useTranslation } from "react-i18next";
import { formatNumber } from "@/shared/lib/format";
import { ORDER_TABS, TAB_STAT_FIELD, type OrderTab } from "../../model/constants";
import type { OrderStats } from "../../model/types";

interface Props {
  value: OrderTab;
  stats: OrderStats | undefined;
  onChange: (tab: OrderTab) => void;
}

/** Status tabs; the counters come from GET /admin/orders/stats/ with the current filters. */
export function OrderStatusTabs({ value, stats, onChange }: Props) {
  const { t } = useTranslation();

  return (
    <Tabs
      activeKey={value}
      onChange={(key) => onChange(key as OrderTab)}
      className="[&_.ant-tabs-nav]:mb-4"
      items={ORDER_TABS.map((tab) => ({
        key: tab,
        label: (
          <span className="inline-flex items-center gap-2">
            {t(`orders.tabs.${tab}`)}
            <span
              className={`min-w-6 rounded-md px-1.5 text-center text-xs leading-5 font-semibold ${
                tab === value ? "bg-brand text-white" : "bg-slate-100 text-slate-600"
              }`}
            >
              {stats ? formatNumber(stats[TAB_STAT_FIELD[tab]]) : "…"}
            </span>
          </span>
        ),
      }))}
    />
  );
}
