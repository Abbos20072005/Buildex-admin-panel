import { Card, Form, Input, Skeleton } from "antd";
import { useTranslation } from "react-i18next";
import { formatDateTime } from "@/shared/lib/format";
import { useIkpuHistoryQuery } from "../../hooks/queries";
import { IKPU_PATTERN, type IkpuChange, type ProductDetail } from "../../model/types";

const TASNIF_URL = "https://tasnif.soliq.uz";

const code = (value: string) => (value ? <span className="font-mono">{value}</span> : "—");

/** Who changed the code, when, from → to and where (the product card or an order). */
function IkpuHistory({ productId }: { productId: number }) {
  const { t } = useTranslation();
  const { data, isPending, isError } = useIkpuHistoryQuery(productId);

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
          <div>
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

/**
 * The tax codes of the receipt: IKPU (MXIK, 17 digits, required before an order is confirmed)
 * and the package code (optional). Both are saved with the product; the journal is below.
 */
export function ProductIkpuCard({ product }: { product: ProductDetail }) {
  const { t } = useTranslation();

  return (
    <Card title={t("products.ikpu.title")}>
      <Form.Item
        name="ikpuCode"
        label={t("products.fields.ikpuCode")}
        extra={
          <>
            {t("products.ikpu.hint")}{" "}
            <a href={TASNIF_URL} target="_blank" rel="noreferrer">
              tasnif.soliq.uz
            </a>
          </>
        }
        rules={[{ pattern: IKPU_PATTERN, message: t("products.ikpu.invalid") }]}
        normalize={(value: string) => value.replace(/\D/g, "")}
      >
        <Input
          inputMode="numeric"
          maxLength={17}
          placeholder="00000000000000000"
          className="font-mono"
        />
      </Form.Item>
      <Form.Item name="packageCode" label={t("products.fields.packageCode")}>
        <Input maxLength={30} className="font-mono" />
      </Form.Item>

      {product.id > 0 && (
        <>
          <div className="mb-2 text-xs font-semibold tracking-wide text-slate-500 uppercase">
            {t("products.ikpu.history")}
          </div>
          <IkpuHistory productId={product.id} />
        </>
      )}
    </Card>
  );
}
