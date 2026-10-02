import { CloseOutlined } from "@ant-design/icons";
import { Button, Select } from "antd";
import { useTranslation } from "react-i18next";
import { ORDER_STATUSES } from "../../model/constants";
import type { OrderStatus } from "../../model/types";

interface Props {
  count: number;
  loading: boolean;
  onChangeStatus: (status: OrderStatus) => void;
  onClear: () => void;
}

export function BulkActionsBar({ count, loading, onChangeStatus, onClear }: Props) {
  const { t } = useTranslation();

  return (
    <div className="mb-3 flex flex-wrap items-center gap-3 rounded-xl bg-navy px-4 py-2.5 text-white shadow-sm">
      <strong className="mr-1">{t("common.selected", { count })}</strong>
      <Select<OrderStatus>
        className="min-w-56"
        placeholder={t("orders.bulk.changeStatus")}
        value={null}
        loading={loading}
        disabled={loading}
        options={ORDER_STATUSES.map((status) => ({ value: status, label: t(`status.${status}`) }))}
        onChange={onChangeStatus}
      />
      <Button
        type="text"
        icon={<CloseOutlined />}
        onClick={onClear}
        className="ml-auto text-slate-300! hover:text-white!"
      >
        {t("orders.bulk.clear")}
      </Button>
    </div>
  );
}
