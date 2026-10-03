import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { OrderStatusTag, PayStatusTag, type Order } from "@/features/orders";
import {
  formatDate,
  formatNumber,
  formatOrderId,
  formatTime,
  maskPhone,
} from "@/shared/lib/format";
import { CardLink, WidgetCard } from "@/shared/ui";

/** The ten latest orders; a row opens the orders page. */
export function RecentOrdersTable({ orders }: { orders: Order[] }) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const heads = [
    "id",
    "date",
    "customer",
    "method",
    "items",
    "total",
    "payment",
    "status",
    "manager",
  ];

  return (
    <WidgetCard
      title={t("today.recent.title")}
      extra={<CardLink to="/orders">{t("today.recent.all")}</CardLink>}
      className="[&_.ant-card-body]:p-0!"
    >
      {orders.length === 0 ? (
        <p className="m-0 px-5 py-8 text-center text-sm text-slate-500">{t("common.noData")}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[960px] border-collapse text-sm">
            <thead>
              <tr className="bg-surface-alt text-left text-xs font-semibold tracking-wide text-slate-500 uppercase">
                {heads.map((head) => (
                  <th
                    key={head}
                    className={`px-3 py-2.5 font-semibold first:pl-5 last:pr-5 ${head === "total" || head === "items" ? "text-right" : ""}`}
                  >
                    {t(`today.recent.columns.${head}`)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr
                  key={order.id}
                  onClick={() => navigate("/orders")}
                  className="cursor-pointer border-t border-slate-100 align-middle hover:bg-slate-50"
                >
                  <td className="py-3 pr-3 pl-5 font-bold text-brand">{formatOrderId(order.id)}</td>
                  <td className="px-3 py-3">
                    <div>{formatDate(order.createdAt)}</div>
                    <div className="text-xs text-slate-400">{formatTime(order.createdAt)}</div>
                  </td>
                  <td className="px-3 py-3">
                    <div className="font-medium">{order.customer.name}</div>
                    <div className="font-mono text-xs text-slate-400">
                      {maskPhone(order.customer.phone)}
                    </div>
                  </td>
                  <td className="px-3 py-3">{t(`fulfillment.${order.fulfillment}`)}</td>
                  <td className="px-3 py-3 text-right tabular-nums">{order.itemsCount}</td>
                  <td className="px-3 py-3 text-right font-bold tabular-nums">
                    {formatNumber(order.total)}
                  </td>
                  <td className="px-3 py-3">
                    <div className="mb-1 text-xs text-slate-500">
                      {order.payType ? t(`payType.${order.payType}`) : "—"}
                    </div>
                    <PayStatusTag status={order.payStatus} />
                  </td>
                  <td className="px-3 py-3">
                    <OrderStatusTag status={order.status} />
                  </td>
                  <td className="py-3 pr-5 pl-3">
                    {order.manager ? (
                      order.manager.name
                    ) : (
                      <span className="text-slate-400">{t("today.recent.unassigned")}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </WidgetCard>
  );
}
