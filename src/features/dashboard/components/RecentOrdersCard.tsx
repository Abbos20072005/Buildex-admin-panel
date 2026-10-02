import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { OrderStatusTag, type Order } from "@/features/orders";
import { formatNumber, formatOrderId } from "@/shared/lib/format";
import { CardLink, WidgetCard } from "./Widgets";

/** The five latest orders; a click opens the orders page. */
export function RecentOrdersCard({ orders }: { orders: Order[] }) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <WidgetCard
      title={t("dashboard.recent.title")}
      extra={<CardLink to="/orders">{t("dashboard.all")}</CardLink>}
      className="[&_.ant-card-body]:p-0!"
    >
      {orders.length === 0 ? (
        <p className="m-0 px-5 py-8 text-center text-sm text-slate-500">{t("common.noData")}</p>
      ) : (
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-surface-alt text-left text-xs font-semibold tracking-wide text-slate-500 uppercase">
              <th className="px-5 py-2.5 font-semibold">{t("dashboard.recent.id")}</th>
              <th className="px-2 py-2.5 font-semibold">{t("dashboard.recent.customer")}</th>
              <th className="px-2 py-2.5 text-right font-semibold">
                {t("dashboard.recent.total")}
              </th>
              <th className="px-5 py-2.5 font-semibold">{t("dashboard.recent.status")}</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr
                key={order.id}
                onClick={() => navigate("/orders")}
                className="cursor-pointer border-t border-slate-100 hover:bg-slate-50"
              >
                <td className="px-5 py-3 font-bold">{formatOrderId(order.id)}</td>
                <td className="px-2 py-3">{order.customer.name}</td>
                <td className="px-2 py-3 text-right tabular-nums">{formatNumber(order.total)}</td>
                <td className="px-5 py-3">
                  <OrderStatusTag status={order.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </WidgetCard>
  );
}
