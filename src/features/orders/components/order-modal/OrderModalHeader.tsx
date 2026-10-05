import { CheckCircleIcon } from "@/shared/icons";
import { Button, Popconfirm } from "antd";
import { useTranslation } from "react-i18next";
import { formatDateTime, formatOrderId } from "@/shared/lib/format";
import { NEXT_STATUS } from "../../model/constants";
import type { OrderDetail, OrderPatch } from "../../model/types";
import { OrderStatusTag, PayStatusTag } from "../OrderTags";

interface Props {
  orderId: number;
  order: OrderDetail | undefined;
  saving: boolean;
  onUpdate: (patch: OrderPatch) => void;
}

export function OrderModalHeader({ orderId, order, saving, onUpdate }: Props) {
  const { t } = useTranslation();
  const next = order ? NEXT_STATUS[order.status] : undefined;
  const isClosed = order?.status === "delivered" || order?.status === "cancelled";

  return (
    <div className="flex flex-wrap items-start justify-between gap-4 pr-10">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2.5">
          <h2 className="m-0 text-[22px] font-bold tracking-tight">
            {t("orders.modal.order")} {formatOrderId(orderId)}
          </h2>
          {order && <OrderStatusTag status={order.status} />}
          {order && <PayStatusTag status={order.payStatus} />}
        </div>

        {order && (
          <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-[13px] font-normal text-slate-500">
            <span>
              {t("orders.modal.created")}:{" "}
              <b className="font-semibold text-slate-800">{formatDateTime(order.createdAt)}</b>
            </span>
            <span>
              {t("orders.modal.fulfillment")}:{" "}
              <b className="font-semibold text-slate-800">
                {t(`fulfillment.${order.fulfillment}`)}
              </b>
            </span>
            {order.updatedAt && (
              <span>
                {t("orders.modal.updated")}:{" "}
                <b className="font-semibold text-slate-800">{formatDateTime(order.updatedAt)}</b>
              </span>
            )}
          </div>
        )}
      </div>

      {order && !isClosed && (
        <div className="flex flex-wrap gap-2">
          <Popconfirm
            title={t("orders.modal.cancelConfirm")}
            okText={t("common.confirm")}
            cancelText={t("common.cancel")}
            okButtonProps={{ danger: true }}
            onConfirm={() => onUpdate({ status: "cancelled" })}
          >
            <Button danger disabled={saving}>
              {t("orders.modal.cancel")}
            </Button>
          </Popconfirm>
          {next && (
            <Button
              type="primary"
              icon={<CheckCircleIcon />}
              loading={saving}
              onClick={() => onUpdate({ status: next })}
            >
              {t(`orders.modal.next.${order.status}`)}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
