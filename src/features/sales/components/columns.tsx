import { Tag, type TableColumnsType } from "antd";
import dayjs from "dayjs";
import type { TFunction } from "i18next";
import { formatNumber } from "@/shared/lib/format";
import type { Sale } from "../model/types";

const DATE = "DD.MM.YYYY";

/** Where today is relative to the sale's period. */
function periodState(sale: Sale): "active" | "upcoming" | "ended" {
  const today = dayjs().startOf("day");
  if (today.isBefore(dayjs(sale.discountFrom))) return "upcoming";
  if (today.isAfter(dayjs(sale.discountTo))) return "ended";
  return "active";
}

const STATE_COLOR = { active: "green", upcoming: "blue", ended: "default" } as const;

/** Aksiya · Muddat · Mahsulotlar · Ko'rinish (the "⋯" column is added by RecordsTable). */
export const saleColumns = (t: TFunction): TableColumnsType<Sale> => [
  {
    key: "name",
    title: t("sales.columns.name"),
    render: (_, sale) => (
      <div className="flex items-center gap-3">
        <span className="grid size-10 shrink-0 place-items-center overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
          {sale.image && <img src={sale.image} alt="" className="size-full object-cover" />}
        </span>
        <div className="min-w-0">
          <div className="truncate font-bold">{sale.name}</div>
          {sale.isMain && (
            <Tag color="gold" variant="filled" className="m-0 mt-0.5 font-semibold">
              {t("sales.main")}
            </Tag>
          )}
        </div>
      </div>
    ),
  },
  {
    key: "period",
    title: t("sales.columns.period"),
    width: 270,
    render: (_, sale) => {
      const state = periodState(sale);
      return (
        <div className="flex flex-wrap items-center gap-2">
          <span className="tabular-nums">
            {dayjs(sale.discountFrom).format(DATE)} – {dayjs(sale.discountTo).format(DATE)}
          </span>
          <Tag color={STATE_COLOR[state]} variant="filled" className="m-0 font-semibold">
            {t(`sales.state.${state}`)}
          </Tag>
        </div>
      );
    },
  },
  {
    key: "products",
    title: t("sales.columns.products"),
    width: 130,
    align: "right",
    render: (_, sale) => <span className="tabular-nums">{formatNumber(sale.productsCount)}</span>,
  },
  {
    key: "visible",
    title: t("sales.columns.visible"),
    width: 150,
    render: (_, sale) => (
      <Tag
        color={sale.isVisible ? "green" : "default"}
        variant="filled"
        className="m-0 font-semibold"
      >
        {t(sale.isVisible ? "sales.visible" : "sales.hidden")}
      </Tag>
    ),
  },
];
