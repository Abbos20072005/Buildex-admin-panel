import { Card, Descriptions, Tag, type DescriptionsProps } from "antd";
import { useTranslation } from "react-i18next";
import { formatDate, formatNumber } from "@/shared/lib/format";
import { useCustomerQuery } from "../../hooks/queries";
import type { OrderDetail } from "../../model/types";
import { PhoneReveal } from "./PhoneReveal";

/** Customer block: basic data from the order + profile stats from GET /admin/customers/{id}/. */
export function CustomerCard({ order }: { order: OrderDetail }) {
  const { t } = useTranslation();
  const { data: customer } = useCustomerQuery(order.customer.id);

  const items: DescriptionsProps["items"] = [
    {
      key: "name",
      label: t("orders.modal.name"),
      children: <b>{customer?.name || order.customer.name}</b>,
    },
    {
      key: "phone",
      label: t("orders.modal.phone"),
      children: <PhoneReveal phone={customer?.phone || order.customer.phone} />,
    },
  ];

  if (customer?.email)
    items.push({ key: "email", label: t("orders.modal.email"), children: customer.email });

  if (customer) {
    items.push(
      {
        key: "segment",
        label: t("orders.modal.segment"),
        children: (
          <span className="flex flex-wrap justify-end gap-1">
            <Tag className="m-0">{t(`role.${customer.role}`, customer.role)}</Tag>
            {customer.blocked && (
              <Tag color="red" className="m-0">
                {t("orders.modal.blocked")}
              </Tag>
            )}
            {!customer.verified && (
              <Tag color="orange" className="m-0">
                {t("orders.modal.notVerified")}
              </Tag>
            )}
          </span>
        ),
      },
      {
        key: "orders",
        label: t("orders.modal.orders"),
        children: t("orders.modal.ordersValue", {
          count: customer.ordersCount,
          sum: formatNumber(customer.totalPurchase),
        }),
      },
    );
    if (customer.createdAt) {
      items.push({
        key: "since",
        label: t("orders.modal.since"),
        children: formatDate(customer.createdAt),
      });
    }
  }

  return (
    <Card title={t("orders.modal.customer")}>
      <Descriptions column={1} size="small" items={items} colon={false} className="info-list" />
    </Card>
  );
}
