import { Table, Tag, type TableColumnsType, type TableProps } from "antd";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { clsx } from "@/shared/lib/clsx";
import { formatNumber } from "@/shared/lib/format";
import { formatRule } from "../lib/rule";
import { PAGE_SIZES } from "../model/constants";
import type { Badge } from "../model/types";
import { BadgeChip } from "./BadgeChip";

interface Props {
  /** checkboxes in the first column (see useRowSelection) */
  rowSelection?: TableProps<Badge>["rowSelection"];
  badges: Badge[];
  total: number;
  loading: boolean;
  page: number;
  pageSize: number;
  selectedId: number | null;
  /** the whole list is on screen and not filtered — rows can be dragged to reorder */
  canReorder: boolean;
  onPageChange: (page: number, pageSize: number) => void;
  onOpen: (id: number) => void;
  /** every badge id in the new order */
  onReorder: (ids: number[]) => void;
}

export function BadgesTable({
  badges,
  total,
  loading,
  page,
  pageSize,
  selectedId,
  canReorder,
  onPageChange,
  onOpen,
  onReorder,
  rowSelection,
}: Props) {
  const { t } = useTranslation();
  const [dragging, setDragging] = useState<number | null>(null);
  const [over, setOver] = useState<number | null>(null);

  const drop = (targetId: number) => {
    if (dragging === null || dragging === targetId) return;
    const ids = badges.map((badge) => badge.id);
    const from = ids.indexOf(dragging);
    const to = ids.indexOf(targetId);
    if (from < 0 || to < 0) return;
    ids.splice(to, 0, ...ids.splice(from, 1));
    onReorder(ids);
  };

  const columns: TableColumnsType<Badge> = [
    {
      key: "badge",
      title: t("badges.columns.badge"),
      width: 190,
      render: (_, badge) => <BadgeChip name={badge.names.uz || badge.name} color={badge.color} />,
    },
    {
      key: "name",
      title: t("badges.columns.name"),
      width: 240,
      render: (_, badge) => (
        <div className="leading-tight">
          <div className="font-bold">
            {badge.names.uz || <span className="text-red-600">{t("badges.missing.uz")}</span>}
          </div>
          <div className="text-xs text-slate-500">
            {badge.names.ru || <span className="text-red-600">{t("badges.missing.ru")}</span>}
          </div>
        </div>
      ),
    },
    {
      key: "kind",
      title: t("badges.columns.kind"),
      width: 130,
      render: (_, badge) => (
        <Tag
          color={badge.kind === "auto" ? "blue" : "default"}
          variant="filled"
          className="m-0 font-semibold"
        >
          {t(`badges.kinds.${badge.kind}`)}
        </Tag>
      ),
    },
    {
      key: "rule",
      title: t("badges.columns.rule"),
      width: 220,
      render: (_, badge) => {
        const rule = formatRule(badge, t);
        return rule ? (
          <span className="font-mono text-[13px] text-slate-600">{rule}</span>
        ) : (
          <span className="text-slate-300">—</span>
        );
      },
    },
    {
      key: "products",
      title: t("badges.columns.products"),
      width: 110,
      align: "right",
      render: (_, badge) => (
        <span className="tabular-nums">{formatNumber(badge.productsCount)}</span>
      ),
    },
    {
      key: "status",
      title: t("badges.columns.status"),
      width: 110,
      render: (_, badge) => (
        <Tag
          color={badge.isActive ? "green" : "gold"}
          variant="filled"
          className="m-0 font-semibold"
        >
          {t(badge.isActive ? "badges.active" : "badges.draft")}
        </Tag>
      ),
    },
  ];

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <Table<Badge>
        rowSelection={rowSelection}
        rowKey="id"
        size="middle"
        columns={columns}
        dataSource={badges}
        loading={loading}
        scroll={{ x: 900 }}
        onRow={(badge) => ({
          draggable: canReorder,
          className: clsx(
            "cursor-pointer",
            badge.id === selectedId && "bg-brand/5",
            over === badge.id && dragging !== badge.id && "bg-brand/10",
            dragging === badge.id && "opacity-40",
          ),
          onClick: (event) => {
            // a click on the checkbox must not open the record
            if ((event.target as HTMLElement).closest(".ant-table-selection-column")) return;
            onOpen(badge.id);
          },
          onDragStart: (event) => {
            event.dataTransfer.effectAllowed = "move";
            setDragging(badge.id);
          },
          onDragOver: (event) => {
            if (dragging === null) return;
            event.preventDefault();
            setOver(badge.id);
          },
          onDrop: (event) => {
            event.preventDefault();
            drop(badge.id);
            setDragging(null);
            setOver(null);
          },
          onDragEnd: () => {
            setDragging(null);
            setOver(null);
          },
        })}
        locale={{ emptyText: <div className="py-10 text-slate-500">{t("common.noData")}</div> }}
        pagination={
          total > badges.length || page > 1
            ? {
                current: page,
                pageSize,
                total,
                showSizeChanger: true,
                pageSizeOptions: PAGE_SIZES,
                showTotal: (count, [from, to]) => `${from}–${to} / ${count}`,
                onChange: onPageChange,
              }
            : false
        }
      />
      {canReorder && badges.length > 1 && (
        <p className="m-0 border-t border-slate-100 px-4 py-2 text-xs text-slate-500">
          {t("badges.dragHint")}
        </p>
      )}
    </div>
  );
}
