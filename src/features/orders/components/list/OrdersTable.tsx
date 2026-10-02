import { Table, type TablePaginationConfig } from "antd";
import type { SorterResult } from "antd/es/table/interface";
import { useTranslation } from "react-i18next";
import { PAGE_SIZES } from "../../model/constants";
import type { Order, OrderSort } from "../../model/types";
import { useOrderColumns } from "./useOrderColumns";

interface Props {
  orders: Order[];
  total: number;
  loading: boolean;
  page: number;
  pageSize: number;
  sort: OrderSort;
  selectedIds: number[];
  onSelect: (ids: number[]) => void;
  onPageChange: (page: number, pageSize: number) => void;
  onSortChange: (sort: OrderSort) => void;
  onOpen: (id: number) => void;
}

export function OrdersTable({
  orders,
  total,
  loading,
  page,
  pageSize,
  sort,
  selectedIds,
  onSelect,
  onPageChange,
  onSortChange,
  onOpen,
}: Props) {
  const { t } = useTranslation();
  const columns = useOrderColumns(sort);

  const handleChange = (
    pagination: TablePaginationConfig,
    _filters: unknown,
    sorter: SorterResult<Order> | SorterResult<Order>[],
  ) => {
    const single = Array.isArray(sorter) ? sorter[0] : sorter;
    const field = single?.columnKey as string | undefined;
    const nextSort: OrderSort =
      field && single.order
        ? ((single.order === "ascend" ? field : `-${field}`) as OrderSort)
        : "-created_at";

    if (nextSort !== sort) onSortChange(nextSort);
    else onPageChange(pagination.current ?? 1, pagination.pageSize ?? pageSize);
  };

  return (
    <Table<Order>
      rowKey="id"
      size="middle"
      columns={columns}
      dataSource={orders}
      loading={loading}
      scroll={{ x: 960 }}
      rowSelection={{
        selectedRowKeys: selectedIds,
        onChange: (keys) => onSelect(keys as number[]),
      }}
      onRow={(order) => ({
        className: "cursor-pointer",
        // clicks on the selection checkbox must not open the order
        onClick: (event) => {
          if ((event.target as HTMLElement).closest(".ant-table-selection-column")) return;
          onOpen(order.id);
        },
      })}
      onChange={handleChange}
      locale={{ emptyText: <div className="py-10 text-slate-500">{t("common.noData")}</div> }}
      pagination={{
        current: page,
        pageSize,
        total,
        showSizeChanger: true,
        pageSizeOptions: PAGE_SIZES,
        showTotal: (count, [from, to]) => `${from}–${to} / ${count}`,
      }}
    />
  );
}
