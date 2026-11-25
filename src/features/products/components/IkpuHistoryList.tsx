import { Skeleton } from "antd";
import { useTranslation } from "react-i18next";
import { formatDateTime } from "@/shared/lib/format";
import { useIkpuChangesQuery } from "../hooks/queries";
import type { IkpuChange, IkpuChangesParams } from "../model/types";

const code = (value: string) => (value ? <span className="font-mono">{value}</span> : "—");

/**
 * The journal of the IKPU / package code changes of one product (`product`) or of one order
 * (`order`): old → new, who, when and where (the product card or an order).
 */
export function IkpuHistoryList(params: IkpuChangesParams) {
  const { t } = useTranslation();
  const { data, isPending, isError } = useIkpuChangesQuery(params);

  if (isPending) return <Skeleton active paragraph={{ rows: 2 }} title={false} />;
  if (isError)
    return <p className="m-0 text-xs text-slate-400">{t("products.ikpu.historyError")}</p>;
  if (!data.length)
    return <p className="m-0 text-xs text-slate-400">{t("products.ikpu.historyEmpty")}</p>;

  const where = (item: IkpuChange) =>
    item.source === "order" && item.orderId
      ? t("products.ikpu.fromOrder", { id: item.orderId })
      : t("products.ikpu.fromProduct");

  return (
    <ul className="m-0 flex list-none flex-col gap-2.5 p-0 text-[13px]">
      {data.map((item) => (
        <li key={item.id} className="border-b border-slate-100 pb-2.5 last:border-0 last:pb-0">
          {/* an order shows many products; a product card knows its own */}
          {params.order !== undefined && item.productName && (
            <div className="font-medium">{item.productName}</div>
          )}
          <div>
            {item.field === "package_code" && (
              <span className="text-slate-500">{t("products.fields.packageCode")}: </span>
            )}
            {code(item.oldValue)} → {code(item.newValue)}
          </div>
          <div className="text-xs text-slate-500">
            {item.changedBy} · {formatDateTime(item.createdAt)} · {where(item)}
          </div>
        </li>
      ))}
    </ul>
  );
}
