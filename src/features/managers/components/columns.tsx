import { Tag, type TableColumnsType } from "antd";
import type { TFunction } from "i18next";
import { formatDateTime } from "@/shared/lib/format";
import { InitialsAvatar } from "@/shared/ui";
import type { Manager } from "../model/types";

/** Menejer · Holat · Yaratilgan (the "⋯" column is added by RecordsTable). */
export const managerColumns = (t: TFunction): TableColumnsType<Manager> => [
  {
    key: "name",
    title: t("managers.columns.name"),
    render: (_, item) => (
      <div className="flex items-center gap-3">
        <InitialsAvatar name={item.fullName} />
        <div className="min-w-0">
          <div className="truncate font-bold">{item.fullName}</div>
          <div className="text-xs text-slate-500">ID {item.id}</div>
        </div>
      </div>
    ),
  },
  {
    key: "status",
    title: t("managers.columns.status"),
    width: 160,
    render: (_, item) => (
      <Tag
        color={item.isActive ? "green" : "default"}
        variant="filled"
        className="m-0 font-semibold"
      >
        {t(item.isActive ? "managers.statusActive" : "managers.statusInactive")}
      </Tag>
    ),
  },
  {
    key: "created",
    title: t("managers.columns.created"),
    width: 180,
    render: (_, item) => formatDateTime(item.createdAt),
  },
];
