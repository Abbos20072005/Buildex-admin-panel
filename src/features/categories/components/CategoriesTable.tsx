import {
  CheckIcon,
  ChevronDownIcon,
  GripIcon,
  LoadingIcon,
  ChevronRightIcon,
} from "@/shared/icons";
import { Table, Tag, type TableColumnsType, type TableProps } from "antd";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { clsx } from "@/shared/lib/clsx";
import { formatNumber } from "@/shared/lib/format";
import { nodeKey } from "../hooks/queries";
import type { CategoryItem, CategoryRow } from "../model/types";

interface Props {
  rows: CategoryRow[];
  loading: boolean;
  /** rows are search results: flat, nothing to open or drag */
  searching: boolean;
  expanded: ReadonlySet<string>;
  selectedKey: string | null;
  /** checkboxes in the first column; row keys are `nodeKey`s */
  rowSelection?: TableProps<CategoryRow>["rowSelection"];
  onToggle: (item: CategoryItem) => void;
  onOpen: (item: CategoryItem) => void;
  /** all brothers and sisters of `item` in their new order */
  onReorder: (item: CategoryItem, ids: number[]) => void;
}

const dash = <span className="text-slate-300">—</span>;
const check = <CheckIcon className="text-green-600" />;

export function CategoriesTable({
  rows,
  loading,
  searching,
  expanded,
  selectedKey,
  rowSelection,
  onToggle,
  onOpen,
  onReorder,
}: Props) {
  const { t } = useTranslation();
  const [dragging, setDragging] = useState<CategoryRow | null>(null);
  const [over, setOver] = useState<string | null>(null);

  /** a row can be dropped only on a brother / sister: same level and same parent */
  const canDrop = (target: CategoryRow) =>
    !!dragging &&
    dragging.canReorder &&
    dragging.item.level === target.item.level &&
    dragging.item.parentId === target.item.parentId &&
    dragging.item.id !== target.item.id;

  const drop = (target: CategoryRow) => {
    if (!dragging || !canDrop(target)) return;
    const ids = [...dragging.siblingIds];
    const from = ids.indexOf(dragging.item.id);
    const to = ids.indexOf(target.item.id);
    if (from < 0 || to < 0) return;
    ids.splice(to, 0, ...ids.splice(from, 1));
    onReorder(dragging.item, ids);
  };

  const columns: TableColumnsType<CategoryRow> = [
    {
      key: "name",
      title: t("categories.columns.name"),
      render: (_, { item, depth, loadingChildren }) => (
        <div className="flex items-center gap-2" style={{ paddingLeft: depth * 22 }}>
          {!searching && (
            <span className="w-4 shrink-0 text-slate-300" title={t("categories.dragHint")}>
              <GripIcon className="cursor-grab" />
            </span>
          )}
          {!searching && item.childrenCount > 0 ? (
            <button
              type="button"
              aria-label={t("categories.toggle")}
              onClick={(event) => {
                event.stopPropagation();
                onToggle(item);
              }}
              className="grid size-5 shrink-0 cursor-pointer place-items-center rounded border-0 bg-transparent text-xs text-slate-500 hover:bg-slate-100"
            >
              {loadingChildren ? (
                <LoadingIcon />
              ) : expanded.has(nodeKey(item)) ? (
                <ChevronDownIcon />
              ) : (
                <ChevronRightIcon />
              )}
            </button>
          ) : (
            !searching && <span className="size-5 shrink-0" />
          )}
          <span className="min-w-0">
            <span className={clsx(item.level === 3 ? "font-medium" : "font-bold")}>
              {item.names.uz || (
                // no Uzbek name yet: show the translated one, greyed out
                <span className="text-slate-400 italic" title={t("categories.noUzName")}>
                  {item.name || t("categories.missing")}
                </span>
              )}
            </span>
            <span className="ml-2 text-xs text-slate-400">L{item.level}</span>
            {searching && item.parentPath && (
              <span className="block truncate text-xs text-slate-400">{item.parentPath}</span>
            )}
          </span>
        </div>
      ),
    },
    {
      key: "ru",
      title: "RU",
      width: 80,
      align: "center",
      render: (_, { item }) =>
        item.names.ru ? (
          check
        ) : (
          <Tag color="red" variant="filled" className="m-0 font-semibold">
            {t("categories.missing")}
          </Tag>
        ),
    },
    {
      key: "products",
      title: t("categories.columns.products"),
      width: 110,
      align: "right",
      render: (_, { item }) => (
        <span className="tabular-nums">{formatNumber(item.productsCount)}</span>
      ),
    },
    {
      key: "site",
      title: t("categories.columns.site"),
      width: 80,
      align: "center",
      render: (_, { item }) => (item.showOnSite ? check : dash),
    },
    {
      key: "app",
      title: t("categories.columns.app"),
      width: 80,
      align: "center",
      render: (_, { item }) => (item.showInApp ? check : dash),
    },
    {
      key: "filters",
      title: t("categories.columns.filters"),
      width: 90,
      align: "right",
      render: (_, { item }) => <span className="tabular-nums">{item.filtersCount}</span>,
    },
    {
      key: "status",
      title: t("categories.columns.status"),
      width: 110,
      render: (_, { item }) => (
        <Tag
          color={item.isActive ? "green" : "gold"}
          variant="filled"
          className="m-0 font-semibold"
        >
          {t(item.isActive ? "categories.active" : "categories.draft")}
        </Tag>
      ),
    },
  ];

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <Table<CategoryRow>
        rowKey={(row) => nodeKey(row.item)}
        size="middle"
        columns={columns}
        dataSource={rows}
        loading={loading}
        pagination={false}
        rowSelection={rowSelection}
        scroll={{ x: 760 }}
        locale={{ emptyText: <div className="py-10 text-slate-500">{t("common.noData")}</div> }}
        onRow={(row) => ({
          draggable: !searching && row.canReorder,
          className: clsx(
            "cursor-pointer",
            selectedKey === nodeKey(row.item) && "bg-brand/5",
            over === nodeKey(row.item) && canDrop(row) && "bg-brand/10",
            dragging && nodeKey(dragging.item) === nodeKey(row.item) && "opacity-40",
          ),
          onClick: (event) => {
            // a click on the checkbox must not open the category
            if ((event.target as HTMLElement).closest(".ant-table-selection-column")) return;
            onOpen(row.item);
          },
          onDragStart: (event) => {
            event.dataTransfer.effectAllowed = "move";
            setDragging(row);
          },
          onDragOver: (event) => {
            if (!canDrop(row)) return;
            event.preventDefault();
            setOver(nodeKey(row.item));
          },
          onDrop: (event) => {
            event.preventDefault();
            drop(row);
            setDragging(null);
            setOver(null);
          },
          onDragEnd: () => {
            setDragging(null);
            setOver(null);
          },
        })}
      />
    </div>
  );
}
