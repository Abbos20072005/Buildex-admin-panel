import { Alert, App, Card, Modal, Skeleton } from "antd";
import { useTranslation } from "react-i18next";
import { getErrorMessage } from "@/shared/api";
import { modalStyles } from "@/theme";
import { useOrderQuery, useUpdateOrder } from "../../hooks/queries";
import type { OrderPatch } from "../../model/types";
import { CommentsCard } from "./CommentsCard";
import { CustomerCard } from "./CustomerCard";
import { FulfillmentCard } from "./FulfillmentCard";
import { ManagerCard } from "./ManagerCard";
import { OrderItemsCard } from "./OrderItemsCard";
import { OrderModalHeader } from "./OrderModalHeader";
import { OrderProgressCard } from "./OrderProgressCard";
import { PaymentCard } from "./PaymentCard";

interface Props {
  orderId: number | null;
  onClose: () => void;
}

function LoadingState() {
  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_400px]">
      <Card>
        <Skeleton active paragraph={{ rows: 6 }} />
      </Card>
      <Card>
        <Skeleton active paragraph={{ rows: 4 }} />
      </Card>
    </div>
  );
}

/** Full order view: items, status flow, customer, fulfillment and payment. */
export function OrderModal({ orderId, onClose }: Props) {
  const { t } = useTranslation();
  const { message } = App.useApp();
  const { data: order, isPending, error } = useOrderQuery(orderId);
  const updateOrder = useUpdateOrder();

  const handleUpdate = (patch: OrderPatch) => {
    if (orderId === null) return;
    updateOrder.mutate(
      { id: orderId, patch },
      {
        onSuccess: () => message.success(t("orders.toast.saved")),
        onError: (err) => message.error(getErrorMessage(err)),
      },
    );
  };

  const saving = updateOrder.isPending;

  return (
    <Modal
      open={orderId !== null}
      onCancel={onClose}
      footer={null}
      width={{ xs: "100%", lg: 1200 }}
      style={{ top: 24, paddingBottom: 24 }}
      destroyOnHidden
      title={
        orderId !== null && (
          <OrderModalHeader
            orderId={orderId}
            order={order}
            saving={saving}
            onUpdate={handleUpdate}
          />
        )
      }
      styles={modalStyles}
    >
      {error ? (
        <Alert
          type="error"
          showIcon
          title={t("orders.modal.loadError")}
          description={getErrorMessage(error)}
        />
      ) : isPending || !order ? (
        <LoadingState />
      ) : (
        <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_400px]">
          <div className="flex min-w-0 flex-col gap-4">
            <OrderItemsCard order={order} />
            <OrderProgressCard order={order} saving={saving} onUpdate={handleUpdate} />
          </div>
          <div className="flex min-w-0 flex-col gap-4">
            <CustomerCard order={order} />
            <FulfillmentCard order={order} />
            <PaymentCard order={order} saving={saving} onUpdate={handleUpdate} />
            <ManagerCard order={order} saving={saving} onUpdate={handleUpdate} />
            <CommentsCard order={order} />
          </div>
        </div>
      )}
    </Modal>
  );
}
