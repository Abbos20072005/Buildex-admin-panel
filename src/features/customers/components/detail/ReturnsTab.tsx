import { Table } from "antd";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useOrdersQuery } from "@/features/orders";
import { customerOrderColumns } from "./orderColumns";

const PAGE_SIZE = 20;

/**
 * "Qaytarishlar": the backend has no returns model, so this is the customer's cancelled orders
 * (the same number as `returns_count`).
 */
export function ReturnsTab({ customerId }: { customerId: number }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const orders = useOrdersQuery({
    filters: { customer: customerId, status: ["cancelled"] },
    page,
    pageSize: PAGE_SIZE,
  });

  return (
    <div>
      <p className="mt-0 mb-3 text-xs text-slate-500">{t("customers.returns.hint")}</p>
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <Table
          rowKey="id"
          size="middle"
          columns={customerOrderColumns(t)}
          dataSource={orders.data?.items ?? []}
          loading={orders.isFetching}
          scroll={{ x: 900 }}
          onRow={(order) => ({
            className: "cursor-pointer",
            onClick: () => navigate(`/orders?order=${order.id}`),
          })}
          locale={{
            emptyText: <div className="py-10 text-slate-400">{t("customers.returns.empty")}</div>,
          }}
          pagination={{
            current: page,
            pageSize: PAGE_SIZE,
            total: orders.data?.total ?? 0,
            showSizeChanger: false,
            hideOnSinglePage: true,
            onChange: setPage,
          }}
        />
      </div>
    </div>
  );
}
