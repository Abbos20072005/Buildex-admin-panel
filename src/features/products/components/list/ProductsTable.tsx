import { Table, type TablePaginationConfig, type TableProps } from "antd";
import type { SorterResult } from "antd/es/table/interface";
import { useTranslation } from "react-i18next";
import { PAGE_SIZES } from "../../model/constants";
import type { Product, ProductSort } from "../../model/types";
import { useProductColumns } from "./useProductColumns";

interface Props {
  /** checkboxes in the first column (see useRowSelection) */
  rowSelection?: TableProps<Product>["rowSelection"];
  products: Product[];
  total: number;
  loading: boolean;
  page: number;
  pageSize: number;
  sort: ProductSort;
  onPageChange: (page: number, pageSize: number) => void;
  onSortChange: (sort: ProductSort) => void;
  onOpen: (id: number) => void;
}

export function ProductsTable({
  products,
  total,
  loading,
  page,
  pageSize,
  sort,
  onPageChange,
  onSortChange,
  onOpen,
  rowSelection,
}: Props) {
  const { t } = useTranslation();
  const columns = useProductColumns(sort);

  const handleChange = (
    pagination: TablePaginationConfig,
    _filters: unknown,
    sorter: SorterResult<Product> | SorterResult<Product>[],
  ) => {
    const single = Array.isArray(sorter) ? sorter[0] : sorter;
    const field = single?.columnKey as string | undefined;
    const nextSort: ProductSort =
      field && single.order
        ? ((single.order === "ascend" ? field : `-${field}`) as ProductSort)
        : "-created_at";

    if (nextSort !== sort) onSortChange(nextSort);
    else onPageChange(pagination.current ?? 1, pagination.pageSize ?? pageSize);
  };

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <Table<Product>
        rowSelection={rowSelection}
        rowKey="id"
        size="middle"
        columns={columns}
        dataSource={products}
        loading={loading}
        scroll={{ x: 980 }}
        onRow={(product) => ({
          className: "cursor-pointer",
          onClick: (event) => {
            // a click on the checkbox must not open the record
            if ((event.target as HTMLElement).closest(".ant-table-selection-column")) return;
            onOpen(product.id);
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
    </div>
  );
}
