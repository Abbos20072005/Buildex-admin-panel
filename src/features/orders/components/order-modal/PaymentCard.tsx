import { Card, Descriptions, Select, type DescriptionsProps } from "antd";
import { useTranslation } from "react-i18next";
import { formatMoney } from "@/shared/lib/format";
import { PAY_STATUSES } from "../../model/constants";
import type { OrderDetail, OrderPatch, PayStatus } from "../../model/types";

interface Props {
  order: OrderDetail;
  saving: boolean;
  onUpdate: (patch: OrderPatch) => void;
}

export function PaymentCard({ order, saving, onUpdate }: Props) {
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
        <Select<PayStatus>
          size="small"
          className="min-w-40"
          value={order.payStatus}
          disabled={saving}
          options={PAY_STATUSES.map((status) => ({
            value: status,
            label: t(`payStatus.${status}`),
          }))}
          onChange={(payStatus) => onUpdate({ payStatus })}
        />
      ),
    },
    { key: "amount", label: t("orders.modal.amount"), children: <b>{formatMoney(order.total)}</b> },
  ];

  if (order.holdId != null) {
    items.push({
      key: "hold",
      label: t("orders.modal.holdId"),
      children: <span className="font-mono">{order.holdId}</span>,
    });
  }

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
