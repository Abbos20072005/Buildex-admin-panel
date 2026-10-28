import { ImageIcon } from "@/shared/icons";
import { Table, Tag, type TableColumnsType, type TableProps } from "antd";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { clsx } from "@/shared/lib/clsx";
import { formatNumber, formatPhone } from "@/shared/lib/format";
import { summarizeSchedule } from "../lib/schedule";
import type { Store } from "../model/types";

const PAGE_SIZES = ["20", "50", "100"];

interface Props {
  rowSelection?: TableProps<Store>["rowSelection"];
  stores: Store[];
  total: number;
  loading: boolean;
  page: number;
  pageSize: number;
  /** the whole list is on screen and not filtered: rows can be dragged to reorder */
  canReorder: boolean;
  onPageChange: (page: number, pageSize: number) => void;
  onOpen: (id: number) => void;
  /** every store id in the new order */
  onReorder: (ids: number[]) => void;
  /** shown when there are no rows: "no stores yet" or "nothing found" */
  emptyText: string;
}

const dash = <span className="text-slate-300">—</span>;

/** The stores: picture, name, address, phone, short hours, state; the rows can be dragged. */
export function StoresTable({
  stores,
  total,
  loading,
  page,
  pageSize,
  canReorder,
  onPageChange,
  onOpen,
  onReorder,
  emptyText,
  rowSelection,
}: Props) {
  const { t } = useTranslation();
  const [dragging, setDragging] = useState<number | null>(null);
  const [over, setOver] = useState<number | null>(null);

  const drop = (targetId: number) => {
    if (dragging === null || dragging === targetId) return;
    const ids = stores.map((store) => store.id);
    const from = ids.indexOf(dragging);
    const to = ids.indexOf(targetId);
    if (from < 0 || to < 0) return;
    ids.splice(to, 0, ...ids.splice(from, 1));
    onReorder(ids);
  };

  const columns: TableColumnsType<Store> = [
    {
      key: "image",
      width: 72,
      render: (_, store) => (
        <span className="grid size-12 place-items-center overflow-hidden rounded-lg border border-slate-200 bg-slate-50 text-lg text-slate-300">
          {store.image ? (
            <img src={store.image} alt="" loading="lazy" className="size-full object-cover" />
          ) : (
            <ImageIcon />
          )}
        </span>
      ),
    },
    {
      key: "name",
      title: t("stores.columns.name"),
      width: 240,
      render: (_, store) => (
        <div className="leading-tight">
          <div className="font-bold">
            {store.names.uz || store.names.ru || (
              <span className="text-red-600">{t("stores.missing")}</span>
            )}
          </div>
          {store.names.uz && store.names.ru && (
            <div className="text-xs text-slate-500">{store.names.ru}</div>
          )}
        </div>
      ),
    },
    {
      key: "address",
      title: t("stores.columns.address"),
      width: 260,
      render: (_, store) => (
        <span className="text-slate-600">{store.addresses.uz || store.addresses.ru || dash}</span>
      ),
    },
    {
      key: "phone",
      title: t("stores.columns.phone"),
      width: 160,
      render: (_, store) =>
        store.phone ? (
          <span className="font-mono text-[13px]">{formatPhone(store.phone)}</span>
        ) : (
          dash
        ),
    },
    {
      key: "hours",
      title: t("stores.columns.hours"),
      width: 240,
      render: (_, store) => (
        <div className="leading-tight">
          <div className="text-[13px]">{summarizeSchedule(store.schedule, t)}</div>
          {store.isActive && (
            <span
              className={clsx(
                "text-xs font-semibold",
                store.isOpenNow ? "text-green-700" : "text-slate-400",
              )}
            >
              {t(store.isOpenNow ? "stores.openNow" : "stores.closedNow")}
            </span>
          )}
        </div>
      ),
    },
    {
      key: "type",
      title: t("stores.columns.type"),
      width: 120,
      render: (_, store) => (
        <Tag variant="filled" className="m-0">
          {t(`stores.types.${store.type}`)}
        </Tag>
      ),
    },
    {
      key: "orders",
      title: t("stores.columns.orders"),
      width: 100,
      align: "right",
      render: (_, store) =>
        store.ordersCount ? (
          <span className="tabular-nums">{formatNumber(store.ordersCount)}</span>
        ) : (
          dash
        ),
    },
    {
      key: "status",
      title: t("stores.columns.status"),
      width: 110,
      render: (_, store) => (
        <Tag
          color={store.isActive ? "green" : "gold"}
          variant="filled"
          className="m-0 font-semibold"
        >
          {t(store.isActive ? "stores.active" : "stores.inactive")}
        </Tag>
      ),
    },
  ];

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <Table<Store>
        rowSelection={rowSelection}
        rowKey="id"
        size="middle"
        columns={columns}
        dataSource={stores}
        loading={loading}
        scroll={{ x: 1200 }}
        onRow={(store) => ({
          draggable: canReorder,
          className: clsx(
            "cursor-pointer",
            over === store.id && dragging !== store.id && "bg-brand/10",
            dragging === store.id && "opacity-40",
            !store.isActive && "text-slate-400",
          ),
          onClick: (event) => {
            // a click on the checkbox must not open the record
            if ((event.target as HTMLElement).closest(".ant-table-selection-column")) return;
            onOpen(store.id);
          },
          onDragStart: (event) => {
            event.dataTransfer.effectAllowed = "move";
            setDragging(store.id);
          },
          onDragOver: (event) => {
            if (dragging === null) return;
            event.preventDefault();
            setOver(store.id);
          },
          onDrop: (event) => {
            event.preventDefault();
            drop(store.id);
            setDragging(null);
            setOver(null);
          },
          onDragEnd: () => {
            setDragging(null);
            setOver(null);
          },
        })}
        locale={{
          emptyText: <div className="py-10 text-slate-500">{emptyText}</div>,
        }}
        pagination={
          total > stores.length || page > 1
            ? {
                current: page,
                pageSize,
                total,
                showSizeChanger: true,
                pageSizeOptions: PAGE_SIZES,
                onChange: onPageChange,
              }
            : false
        }
      />
      {canReorder && stores.length > 1 && (
        <p className="m-0 border-t border-slate-100 px-4 py-2 text-xs text-slate-500">
          {t("stores.dragHint")}
        </p>
      )}
    </div>
  );
}
