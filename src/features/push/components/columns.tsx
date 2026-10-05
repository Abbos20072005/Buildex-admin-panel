import { Tag, type TableColumnsType } from "antd";
import type { TFunction } from "i18next";
import { formatDateTime, formatNumber } from "@/shared/lib/format";
import { STATUS_COLOR } from "../model/constants";
import type { Push } from "../model/types";

const dash = <span className="text-slate-400">—</span>;

/** Kampaniya · Deeplink · Vaqt · Holat · Ochildi (the "⋯" column is added by RecordsTable). */
export const pushColumns = (t: TFunction): TableColumnsType<Push> => [
  {
    key: "campaign",
    title: t("push.columns.campaign"),
    width: 340,
    render: (_, item) => (
      <div className="max-w-[320px]">
        <div className="truncate font-bold">{item.title}</div>
        <div className="truncate text-xs text-slate-500">{item.bodyUz || item.bodyRu || dash}</div>
      </div>
    ),
  },
  {
    key: "deeplink",
    title: t("push.columns.deeplink"),
    width: 240,
    ellipsis: true,
    render: (_, item) =>
      item.deeplink ? <span className="font-mono text-xs">{item.deeplink}</span> : dash,
  },
  {
    key: "time",
    title: t("push.columns.time"),
    width: 160,
    // a draft has no publish time yet
    render: (_, item) => (item.status === "draft" ? dash : formatDateTime(item.publishAt)),
  },
  {
    key: "status",
    title: t("push.columns.status"),
    width: 160,
    render: (_, item) => (
      <Tag color={STATUS_COLOR[item.status]} variant="filled" className="m-0 font-semibold">
        {t(`push.status.${item.status}`)}
      </Tag>
    ),
  },
  {
    key: "reads",
    title: t("push.columns.opened"),
    width: 110,
    align: "right",
    render: (_, item) => (item.status === "published" ? formatNumber(item.reads) : dash),
  },
];
