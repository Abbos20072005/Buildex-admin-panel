import { Skeleton } from "antd";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { OrderStatusTag, type Order } from "@/features/orders";
import { formatDate, formatNumber, formatOrderId } from "@/shared/lib/format";
import { CardEmpty, SectionCard } from "./SectionCard";

interface Props {
  orders: Order[] | undefined;
  /** opens the "Buyurtmalar" tab */
  onShowAll: () => void;
}

/** The newest orders of the customer, one line each. */
export function RecentOrdersCard({ orders, onShowAll }: Props) {
  const { t } = useTranslation();
  return (
    <SectionCard
      title={t("customers.recentOrders.title")}
      flush
      extra={
        <button
          type="button"
          onClick={onShowAll}
          className="cursor-pointer border-0 bg-transparent p-0 text-sm font-medium text-brand"
        >
          {t("customers.recentOrders.all")}
        </button>
      }
    >
      {!orders ? (
        <div className="px-5 py-4">
          <Skeleton active paragraph={{ rows: 3 }} title={false} />
        </div>
      ) : orders.length === 0 ? (
        <div className="px-5 py-2">
          <CardEmpty>{t("customers.recentOrders.empty")}</CardEmpty>
        </div>
      ) : (
        <ul className="m-0 list-none p-0">
          {orders.slice(0, 4).map((order) => (
            <li
              key={order.id}
              className="grid grid-cols-[84px_90px_minmax(0,1fr)_auto] items-center gap-3 border-b border-slate-100 px-5 py-3 text-sm last:border-b-0"
            >
              <Link to={`/orders?order=${order.id}`} className="font-mono font-semibold text-brand">
                {formatOrderId(order.id)}
              </Link>
              <span className="text-slate-500">{formatDate(order.createdAt)}</span>
              <span className="text-right font-medium tabular-nums">
                {formatNumber(order.total)}
              </span>
              <OrderStatusTag status={order.status} />
            </li>
          ))}
        </ul>
      )}
    </SectionCard>
  );
}
