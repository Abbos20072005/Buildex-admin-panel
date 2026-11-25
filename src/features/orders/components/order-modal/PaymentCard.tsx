import { Card, Descriptions, type DescriptionsProps } from "antd";
import { useTranslation } from "react-i18next";
import { formatMoney } from "@/shared/lib/format";
import type { OrderDetail } from "../../model/types";
import { PayStatusTag } from "../OrderTags";

/**
 * The payment of an order. The state is only read: it follows the answers of Atmos (hold, taken,
 * returned) and is never set by hand (BLD-551); the Atmos transaction id stands beside it.
 */
export function PaymentCard({ order }: { order: OrderDetail }) {
  const { t } = useTranslation();

  const items: DescriptionsProps["items"] = [
    {
      key: "method",
      label: t("orders.modal.method"),
      children: order.payType ? t(`payType.${order.payType}`) : "—",
    },
    {
      key: "status",
      label: t("orders.modal.payStatus"),
      children: (
        <span className="inline-flex flex-wrap items-center justify-end gap-2">
          <PayStatusTag status={order.payStatus} />
          {order.transactionId && (
            <span className="font-mono text-xs text-slate-500" title={t("orders.modal.transactionId")}>
              #{order.transactionId}
            </span>
          )}
        </span>
      ),
    },
    { key: "amount", label: t("orders.modal.amount"), children: <b>{formatMoney(order.total)}</b> },
  ];

  items.push({
    key: "receipt",
    label: t("orders.modal.receipt"),
    children: order.ofdUrl ? (
      <a href={order.ofdUrl} target="_blank" rel="noopener noreferrer" className="font-semibold">
        {t("orders.modal.openReceipt")} ↗
      </a>
    ) : (
      "—"
    ),
  });

  return (
    <Card title={t("orders.modal.payment")}>
      <Descriptions column={1} size="small" items={items} colon={false} className="info-list" />
    </Card>
  );
}
