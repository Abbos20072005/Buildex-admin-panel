import { Tabs } from "antd";
import { useTranslation } from "react-i18next";
import { clsx } from "@/shared/lib/clsx";
import { formatNumber } from "@/shared/lib/format";
import { ALERT_TABS, PRODUCT_TABS, type ProductTab } from "../../model/constants";

interface Props {
  value: ProductTab;
  counts: Record<ProductTab, number> | undefined;
  onChange: (tab: ProductTab) => void;
}

/** Publish-status tabs; counters come from GET /admin/products/stats/ with the current filters. */
export function ProductTabs({ value, counts, onChange }: Props) {
  const { t } = useTranslation();

  return (
    <Tabs
      activeKey={value}
      onChange={(key) => onChange(key as ProductTab)}
      className="[&_.ant-tabs-nav]:mb-4"
      items={PRODUCT_TABS.map((tab) => {
        const count = counts?.[tab];
        const alert = ALERT_TABS.includes(tab) && !!count;
        return {
          key: tab,
          label: (
            <span className="inline-flex items-center gap-2">
              {t(`products.tabs.${tab}`)}
              <span
                className={clsx(
                  "min-w-6 rounded-md px-1.5 text-center text-xs leading-5 font-semibold",
                  tab === value
                    ? "bg-brand text-white"
                    : alert
                      ? "bg-red-50 text-red-600"
                      : "bg-slate-100 text-slate-600",
                )}
              >
                {count === undefined ? "…" : formatNumber(count)}
              </span>
            </span>
          ),
        };
      })}
    />
  );
}
