import { ChevronRightIcon } from "@/shared/icons";
import type { ReactNode } from "react";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { formatMoney, formatNumber } from "@/shared/lib/format";
import type { Today } from "../model/types";

function SummaryCard({
  to,
  label,
  value,
  note,
}: {
  to: string;
  label: string;
  value: string;
  note: ReactNode;
}) {
  return (
    <Link
      to={to}
      className="block rounded-xl border border-slate-200 bg-white p-5 text-inherit transition hover:border-brand"
    >
      <div className="flex items-center justify-between text-sm font-semibold text-slate-500">
        {label}
        <ChevronRightIcon className="text-xs text-slate-400" />
      </div>
      <div className="mt-2 text-3xl leading-none font-extrabold tabular-nums">{value}</div>
      <div className="mt-2 text-xs text-slate-500">{note}</div>
    </Link>
  );
}

/** Today's orders, orders waiting for confirmation, being collected and being delivered. */
export function SummaryCards({ cards }: { cards: Today["cards"] }) {
  const { t } = useTranslation();
  const today = dayjs().format("YYYY-MM-DD");
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <SummaryCard
        to={`/orders?from=${today}&to=${today}`}
        label={t("today.cards.today")}
        value={formatNumber(cards.todayOrders)}
        note={t("today.cards.todayTotal", { total: formatMoney(cards.todayTotal) })}
      />
      <SummaryCard
        to="/orders?tab=new"
        label={t("today.cards.pending")}
        value={formatNumber(cards.pending)}
        note={t("today.cards.stale", { count: cards.stalePending, minutes: cards.staleMinutes })}
      />
      <SummaryCard
        to="/orders?tab=assembling"
        label={t("today.cards.collecting")}
        value={formatNumber(cards.collecting)}
        note={t("today.cards.newCustomers", { count: cards.todayCustomers })}
      />
      <SummaryCard
        to="/orders?tab=onTheWay"
        label={t("today.cards.delivering")}
        value={formatNumber(cards.delivering)}
        note={t("today.cards.inTransit")}
      />
    </div>
  );
}
