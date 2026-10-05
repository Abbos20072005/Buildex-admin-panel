import type { TableColumnsType } from "antd";
import { Tag } from "antd";
import type { TFunction } from "i18next";
import { formatDateTime, formatNumber } from "@/shared/lib/format";
import type { AdBlock } from "../model/types";

export const adBlockColumns = (t: TFunction): TableColumnsType<AdBlock> => [
  {
    key: "name",
    title: t("adBlocks.columns.name"),
    render: (_, item) => (
      <div>
        <div className="font-bold">{item.name}</div>
        <div className="text-xs text-slate-500">{item.title}</div>
      </div>
    ),
  },
  {
    key: "brand",
    title: t("adBlocks.columns.brand"),
    width: 180,
    render: (_, item) => item.brand?.name ?? <span className="text-slate-400">—</span>,
  },
  {
    key: "products",
    title: t("adBlocks.columns.products"),
    width: 110,
    align: "right",
    render: (_, item) => formatNumber(item.productsCount),
  },
  {
    key: "status",
    title: t("adBlocks.columns.status"),
    width: 140,
    render: (_, item) => (
      <Tag
        color={item.isVisible ? "green" : "default"}
        variant="filled"
        className="m-0 font-semibold"
      >
        {t(item.isVisible ? "adBlocks.visible" : "adBlocks.hidden")}
      </Tag>
    ),
  },
  {
    key: "created",
    title: t("adBlocks.columns.created"),
    width: 160,
    render: (_, item) => <span className="text-slate-500">{formatDateTime(item.createdAt)}</span>,
  },
];
