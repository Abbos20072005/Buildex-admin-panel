import { Alert, Card, Form, Select, Steps } from "antd";
import { useTranslation } from "react-i18next";
import { formatDateTime } from "@/shared/lib/format";
import { ORDER_FLOW, ORDER_STATUSES } from "../../model/constants";
import type { OrderDetail, OrderPatch, OrderStatus } from "../../model/types";

interface Props {
  order: OrderDetail;
  saving: boolean;
  onUpdate: (patch: OrderPatch) => void;
}

export function OrderProgressCard({ order, saving, onUpdate }: Props) {
  const { t } = useTranslation();
  const current = ORDER_FLOW.indexOf(order.status);

  return (
    <Card title={t("orders.modal.progress")}>
      {order.status === "cancelled" ? (
        <Alert
          type="error"
          showIcon
          title={`${t("status.cancelled")} · ${formatDateTime(order.updatedAt)}`}
        />
      ) : (
        <Steps
          orientation="vertical"
          size="small"
          current={current}
          items={ORDER_FLOW.map((status, index) => ({
            title: t(`status.${status}`),
            content:
              index === 0
                ? formatDateTime(order.createdAt)
                : index === current
                  ? formatDateTime(order.updatedAt)
                  : undefined,
          }))}
        />
      )}

      <Form layout="vertical" className="mt-4">
        <Form.Item label={t("orders.modal.changeStatus")} className="mb-0">
          <Select<OrderStatus>
            value={order.status}
            disabled={saving}
            options={ORDER_STATUSES.map((status) => ({
              value: status,
              label: t(`status.${status}`),
            }))}
            onChange={(status) => onUpdate({ status })}
          />
        </Form.Item>
      </Form>
    </Card>
  );
}
