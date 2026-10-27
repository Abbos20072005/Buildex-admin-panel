import { Table } from "antd";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useOrdersQuery, useOrderStatsQuery, type OrderStatus } from "@/features/orders";
import { clsx } from "@/shared/lib/clsx";
import { customerOrderColumns } from "./orderColumns";

type Group = "all" | "progress" | "done" | "cancelled";

const GROUPS: Group[] = ["all", "progress", "done", "cancelled"];

/** The order statuses each group of the pills holds. */
const GROUP_STATUSES: Record<Group, OrderStatus[] | undefined> = {
  all: undefined,
  progress: ["new", "assembling", "onTheWay"],
  done: ["delivered"],
  cancelled: ["cancelled"],
};

const PAGE_SIZE = 20;

/** Every order of the customer, with pills by the stage of the order. */
export function OrdersTab({ customerId }: { customerId: number }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [group, setGroup] = useState<Group>("all");
  const [page, setPage] = useState(1);

  const stats = useOrderStatsQuery({ customer: customerId });
  const orders = useOrdersQuery({
    filters: { customer: customerId, status: GROUP_STATUSES[group] },
    page,
    pageSize: PAGE_SIZE,
  });

  const counts: Record<Group, number | undefined> = {
    all: stats.data?.total,
    progress: stats.data && stats.data.pending + stats.data.collecting + stats.data.delivering,
    done: stats.data?.completed,
    cancelled: stats.data?.canceled,
  };

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-2">
        {GROUPS.map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => {
              setGroup(key);
              setPage(1);
            }}
            className={clsx(
              "flex cursor-pointer items-center gap-2 rounded-full border-0 px-3.5 py-1.5 text-sm font-semibold",
              key === group
                ? "bg-brand-soft text-brand"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200",
            )}
          >
            {t(`customers.orderGroups.${key}`)}
            {counts[key] !== undefined && (
              <span className="rounded-full bg-white px-2 text-xs text-slate-500 tabular-nums">
                {counts[key]}
              </span>
            )}
          </button>
        ))}
      </div>
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
          locale={{ emptyText: <div className="py-10 text-slate-500">{t("common.noData")}</div> }}
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
