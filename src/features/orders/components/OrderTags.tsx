import { Tag } from "antd";
import { useTranslation } from "react-i18next";
import { PAY_STATUS_COLOR, STATUS_COLOR } from "../model/constants";
import type { OrderStatus, PayStatus } from "../model/types";

export function OrderStatusTag({ status }: { status: OrderStatus }) {
  const { t } = useTranslation();
  return (
    <Tag color={STATUS_COLOR[status]} variant="filled" className="m-0 font-semibold">
      {t(`status.${status}`)}
    </Tag>
  );
}

export function PayStatusTag({ status }: { status: PayStatus }) {
  const { t } = useTranslation();
  return (
    <Tag color={PAY_STATUS_COLOR[status]} variant="filled" className="m-0 font-medium">
      {t(`payStatus.${status}`)}
    </Tag>
  );
}
