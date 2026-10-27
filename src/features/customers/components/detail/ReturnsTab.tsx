import { Table } from "antd";
import { useTranslation } from "react-i18next";

/**
 * Returns of the customer. The admin API has no returns yet (docs/customers-backend-request.md):
 * the table of the design (№ · Buyurtma · Sana · Summa · Holat) is shown empty, with the note.
 */
export function ReturnsTab() {
  const { t } = useTranslation();
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <Table
        rowKey="id"
        size="middle"
        dataSource={[]}
        pagination={false}
        columns={[
          { key: "number", title: t("customers.returns.number") },
          { key: "order", title: t("customers.returns.order") },
          { key: "date", title: t("customers.returns.date") },
          { key: "amount", title: t("customers.returns.amount"), align: "right" },
          { key: "status", title: t("customers.returns.status") },
        ]}
        locale={{
          emptyText: <div className="py-10 text-slate-400">{t("customers.returns.soon")}</div>,
        }}
      />
    </div>
  );
}
