import { Card, Form, Input } from "antd";
import { useTranslation } from "react-i18next";
import { IKPU_PATTERN, PACKAGE_CODE_PATTERN, type ProductDetail } from "../../model/types";
import { IkpuHistoryList } from "../IkpuHistoryList";

const TASNIF_URL = "https://tasnif.soliq.uz";

/**
 * The tax codes of the receipt: IKPU (MXIK, 17 digits, required before an order is confirmed)
 * and the package code (optional, 1-20 digits). Both are saved with the product; the journal is below.
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
      <Form.Item
        name="packageCode"
        label={t("products.fields.packageCode")}
        rules={[{ pattern: PACKAGE_CODE_PATTERN, message: t("products.ikpu.packageInvalid") }]}
        normalize={(value: string) => value.replace(/\D/g, "")}
      >
        <Input inputMode="numeric" maxLength={20} className="font-mono" />
      </Form.Item>

      {product.id > 0 && (
        <>
          <div className="mb-2 text-xs font-semibold tracking-wide text-slate-500 uppercase">
            {t("products.ikpu.history")}
          </div>
          <IkpuHistoryList product={product.id} />
        </>
      )}
    </Card>
  );
}
