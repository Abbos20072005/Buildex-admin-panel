import { Card, Select } from "antd";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useManagersQuery } from "../../hooks/queries";
import type { OrderDetail, OrderPatch } from "../../model/types";

/** `null` can't be an option value in antd, so "unassigned" is 0 (ids start at 1) */
const UNASSIGNED = 0;

interface Props {
  order: OrderDetail;
  saving: boolean;
  onUpdate: (patch: OrderPatch) => void;
}

/** Manager responsible for the order; changes are logged to the notes by the backend. */
export function ManagerCard({ order, saving, onUpdate }: Props) {
  const { t } = useTranslation();
  const managers = useManagersQuery();
  const current = order.manager;

  const options = useMemo(() => {
    const list = managers.data ?? [];
    // an inactive manager already on the order is not in the active list — keep him visible
    const all = current && !list.some((item) => item.id === current.id) ? [current, ...list] : list;
    return [
      { value: UNASSIGNED, label: t("orders.modal.unassigned") },
      ...all.map((item) => ({ value: item.id, label: item.name })),
    ];
  }, [managers.data, current, t]);

  return (
    <Card title={t("orders.modal.manager")}>
      <Select<number>
        className="w-full"
        value={current?.id ?? UNASSIGNED}
        options={options}
        loading={managers.isFetching}
        disabled={saving}
        onChange={(id) => onUpdate({ manager: id === UNASSIGNED ? null : id })}
      />
      <p className="m-0 mt-2 text-xs text-slate-500">{t("orders.modal.managerHint")}</p>
    </Card>
  );
}
