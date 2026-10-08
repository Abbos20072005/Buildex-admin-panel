import { TrashIcon, EditIcon, MoreIcon } from "@/shared/icons";
import { Button, Dropdown, Table, type TableColumnsType } from "antd";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";

const PAGE_SIZES = ["20", "50", "100"];

export interface RowMenuItem {
  key: string;
  label: ReactNode;
  icon?: ReactNode;
  danger?: boolean;
  disabled?: boolean;
  /** a line above this item */
  separated?: boolean;
}

interface Props<T> {
  /** content columns — the "⋯" actions column is added here */
  columns: TableColumnsType<T>;
  items: T[];
  total: number;
  loading: boolean;
  page: number;
  pageSize: number;
  onPageChange: (page: number, pageSize: number) => void;
  onOpen: (item: T) => void;
  /** used by the default "Edit / Delete" menu */
  onDelete?: (item: T) => void;
  /** replaces the default menu: the actions of one row, and what a click on one does */
  rowMenu?: (item: T) => RowMenuItem[];
  onMenuAction?: (key: string, item: T) => void;
  /** search and filters shown inside the same card, above the table */
  toolbar?: ReactNode;
  /** text at the left of the footer; default "1–20 / 143" */
  totalLabel?: (shown: number, total: number) => string;
}

/** Paginated list of records: a click on a row opens it, the "⋯" menu edits or deletes. */
export function RecordsTable<T extends { id: number }>({
  columns,
  items,
  total,
  loading,
  page,
  pageSize,
  onPageChange,
  onOpen,
  onDelete,
  rowMenu,
  onMenuAction,
  toolbar,
  totalLabel,
}: Props<T>) {
  const { t } = useTranslation();

  const allColumns: TableColumnsType<T> = [
    ...columns,
    {
      key: "actions",
      width: 56,
      align: "right",
      render: (_, item) => (
        // the menu must not open the record
        <span onClick={(event) => event.stopPropagation()}>
          <Dropdown
            trigger={["click"]}
            menu={
              rowMenu
                ? {
                    items: rowMenu(item).flatMap(({ separated, ...entry }) =>
                      separated ? [{ type: "divider" as const }, entry] : [entry],
                    ),
                    onClick: ({ key }) => onMenuAction?.(key, item),
                  }
                : {
                    items: [
                      { key: "edit", icon: <EditIcon />, label: t("common.edit") },
                      {
                        key: "delete",
                        icon: <TrashIcon />,
                        label: t("common.delete"),
                        danger: true,
                      },
                    ],
                    onClick: ({ key }) => (key === "edit" ? onOpen(item) : onDelete?.(item)),
                  }
            }
          >
            <Button type="text" icon={<MoreIcon />} aria-label={t("common.actions")} />
          </Dropdown>
        </span>
      ),
    },
  ];

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      {toolbar && <div className="flex flex-wrap gap-3 p-4">{toolbar}</div>}
      <Table<T>
        rowKey="id"
        size="middle"
        columns={allColumns}
        dataSource={items}
        loading={loading}
        scroll={{ x: 640 }}
        onRow={(item) => ({ className: "cursor-pointer", onClick: () => onOpen(item) })}
        locale={{ emptyText: <div className="py-10 text-slate-500">{t("common.noData")}</div> }}
        pagination={{
          current: page,
          pageSize,
          total,
          showSizeChanger: true,
          pageSizeOptions: PAGE_SIZES,
          showTotal: (count, [from, to]) =>
            totalLabel ? totalLabel(to - from + 1, count) : `${from}–${to} / ${count}`,
          onChange: onPageChange,
        }}
      />
    </div>
  );
}
