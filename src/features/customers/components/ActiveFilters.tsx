import { Button, Tag } from "antd";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";
import { formatNumber } from "@/shared/lib/format";
import { stateOfFilters, type ChipKey, type CustomerTab } from "../lib/filters";
import type { CustomerFilters } from "../model/types";

interface Props {
  filters: CustomerFilters;
  tab: CustomerTab;
  /** how many customers match */
  total: number | undefined;
  onClearTab: () => void;
  onClear: (key: ChipKey) => void;
  onClearAll: () => void;
}

const day = (value: string) => dayjs(value).format("DD.MM.YY");
const pair = (from: string | number | undefined, to: string | number | undefined) =>
  `${from ?? ""} – ${to ?? ""}`;

/** "1 filtr · 2 natija" and a removable chip for every filter in force. */
export function ActiveFilters({ filters, tab, total, onClearTab, onClear, onClearAll }: Props) {
  const { t } = useTranslation();
  const state = stateOfFilters(filters);

  const chips: { key: ChipKey; label: string }[] = [];
  const add = (key: ChipKey, label: string) => chips.push({ key, label });
  if (filters.search) add("search", t("customers.chips.search", { value: filters.search }));
  if (filters.segment) add("segment", t(`customers.segments.${filters.segment}`));
  if (state) add("state", t(`customers.stateFilter.${state}`));
  if (filters.channel) add("channel", t(`customers.channel.${filters.channel}`));
  if (filters.from || filters.to) {
    add(
      "registered",
      `${t("customers.filters.registered")}: ${pair(
        filters.from && day(filters.from),
        filters.to && day(filters.to),
      )}`,
    );
  }
  if (filters.ordersMin !== undefined || filters.ordersMax !== undefined) {
    add(
      "orders",
      `${t("customers.filters.orders")}: ${pair(filters.ordersMin, filters.ordersMax)}`,
    );
  }
  if (filters.purchaseMin !== undefined || filters.purchaseMax !== undefined) {
    add(
      "purchase",
      `${t("customers.filters.purchase")}: ${pair(
        filters.purchaseMin === undefined ? undefined : formatNumber(filters.purchaseMin),
        filters.purchaseMax === undefined ? undefined : formatNumber(filters.purchaseMax),
      )}`,
    );
  }
  if (filters.lastOrderFrom || filters.lastOrderTo) {
    add(
      "lastOrder",
      `${t("customers.filters.lastOrder")}: ${pair(
        filters.lastOrderFrom && day(filters.lastOrderFrom),
        filters.lastOrderTo && day(filters.lastOrderTo),
      )}`,
    );
  }
  if (filters.hasReturns) add("returns", t("customers.filters.hasReturns"));
  if (filters.hasOrders !== undefined) {
    add("hasOrders", t(`customers.ordersFilter.${filters.hasOrders ? "with" : "without"}`));
  }
  if (filters.role) add("role", t(`role.${filters.role}`));

  const count = chips.length + (tab === "all" ? 0 : 1);
  if (count === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 border-t border-slate-100 px-4 py-3 text-sm">
      <span className="text-slate-500">
        {t("customers.filters.summary", {
          count,
          total: total === undefined ? "…" : formatNumber(total),
        })}
      </span>
      {tab !== "all" && (
        <Tag closable color="blue" variant="filled" className="m-0" onClose={onClearTab}>
          {t("customers.chips.tab", { value: t(`customers.tabs.${tab}`) })}
        </Tag>
      )}
      {chips.map((chip) => (
        <Tag
          key={chip.key}
          closable
          color="blue"
          variant="filled"
          className="m-0"
          onClose={() => onClear(chip.key)}
        >
          {chip.label}
        </Tag>
      ))}
      <Button type="link" size="small" onClick={onClearAll}>
        {t("customers.filters.clearAll")}
      </Button>
    </div>
  );
}
