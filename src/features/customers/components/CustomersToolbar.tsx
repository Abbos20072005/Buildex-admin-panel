import { Button, Input } from "antd";
import { useTranslation } from "react-i18next";
import { ChevronDownIcon, FilterIcon, SearchIcon } from "@/shared/icons";
import { clsx } from "@/shared/lib/clsx";
import { formatNumber } from "@/shared/lib/format";
import { visibleTabs, type CustomerTab } from "../lib/filters";

interface Props {
  search: string;
  onSearch: (value: string) => void;
  tab: CustomerTab;
  onTab: (tab: CustomerTab) => void;
  counts: Partial<Record<CustomerTab, number>>;
  panelOpen: boolean;
  onTogglePanel: () => void;
  /** filters held in the panel */
  filterCount: number;
}

/** The search box, the tabs with their counters, and the button that opens the filter panel. */
export function CustomersToolbar({
  search,
  onSearch,
  tab,
  onTab,
  counts,
  panelOpen,
  onTogglePanel,
  filterCount,
}: Props) {
  const { t } = useTranslation();
  return (
    <div className="flex w-full flex-wrap items-center gap-2">
      <Input
        allowClear
        className="w-full sm:w-72"
        prefix={<SearchIcon className="text-slate-400" />}
        placeholder={t("customers.search")}
        value={search}
        onChange={(event) => onSearch(event.target.value)}
      />
      <div className="flex flex-wrap items-center gap-2">
        {visibleTabs().map((key) => {
          const active = key === tab;
          const count = counts[key];
          return (
            <button
              key={key}
              type="button"
              onClick={() => onTab(key)}
              className={clsx(
                "flex cursor-pointer items-center gap-2 rounded-full border-0 px-3.5 py-1.5 text-sm font-semibold transition-colors",
                active
                  ? "bg-brand-soft text-brand"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200",
              )}
            >
              {t(`customers.tabs.${key}`)}
              {count !== undefined && (
                <span
                  className={clsx(
                    "rounded-full px-2 text-xs tabular-nums",
                    active
                      ? "bg-white text-brand dark:bg-brand/30 dark:text-slate-900"
                      : "bg-white/70 text-slate-500 dark:bg-slate-300 dark:text-slate-700",
                  )}
                >
                  {formatNumber(count)}
                </span>
              )}
            </button>
          );
        })}
      </div>
      <Button className="ml-auto" icon={<FilterIcon />} onClick={onTogglePanel}>
        {t("customers.filters.button")}
        {filterCount > 0 && <span className="text-brand">{filterCount}</span>}
        <ChevronDownIcon className={clsx("transition-transform", panelOpen && "rotate-180")} />
      </Button>
    </div>
  );
}
