import { DeleteOutlined, EditOutlined, MoreOutlined } from "@ant-design/icons";
import { Button, Dropdown, Table, type TableColumnsType } from "antd";
import { useTranslation } from "react-i18next";

const PAGE_SIZES = ["20", "50", "100"];

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
  onDelete: (item: T) => void;
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
            menu={{
              items: [
                { key: "edit", icon: <EditOutlined />, label: t("common.edit") },
                {
                  key: "delete",
                  icon: <DeleteOutlined />,
                  label: t("common.delete"),
                  danger: true,
                },
              ],
              onClick: ({ key }) => (key === "edit" ? onOpen(item) : onDelete(item)),
            }}
          >
            <Button type="text" icon={<MoreOutlined />} aria-label={t("common.actions")} />
          </Dropdown>
        </span>
      ),
    },
  ];

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
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
          showTotal: (count, [from, to]) => `${from}–${to} / ${count}`,
          onChange: onPageChange,
        }}
      />
    </div>
  );
}
