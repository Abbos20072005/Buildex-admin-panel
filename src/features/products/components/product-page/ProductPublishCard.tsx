import { Card, Form, Select, Switch, Tag } from "antd";
import { useTranslation } from "react-i18next";
import { getReadiness } from "../../lib/readiness";
import { PUBLISH_STATUSES } from "../../model/constants";
import type { ProductDetail } from "../../model/types";
import { PublishStatusTag } from "../ProductBits";
import { withFormValues, type ProductFormValues } from "./form";
import { ReadinessChecklist } from "./ReadinessChecklist";

/** Publish status, visibility switches and the readiness checklist (live, with unsaved edits). */
export function ProductPublishCard({ product }: { product: ProductDetail }) {
  const { t } = useTranslation();
  const form = Form.useFormInstance<ProductFormValues>();
  const values = Form.useWatch((all: ProductFormValues) => all, { form, preserve: true });

  const checks = getReadiness(withFormValues(product, values));
  const done = checks.filter((check) => check.done).length;
  const ready = done === checks.length;

  return (
    <Card
      title={t("products.modal.publish")}
      extra={<PublishStatusTag status={product.publishStatus} />}
    >
      <div className="mb-2 flex items-center justify-between">
        <span className="font-semibold">{t("products.modal.readiness")}</span>
        <Tag color={ready ? "green" : "gold"} variant="filled" className="m-0 font-semibold">
          {done} / {checks.length}
        </Tag>
      </div>

      <ReadinessChecklist product={product} values={values} checks={checks} />

      <Form.Item name="publishStatus" label={t("products.modal.publishStatus")}>
        <Select
          options={PUBLISH_STATUSES.map((status) => ({
            value: status,
            label: t(`publishStatus.${status}`),
          }))}
        />
      </Form.Item>

      <div className="space-y-3 border-t border-slate-100 pt-3">
        <label className="flex items-center justify-between gap-3">
          <span>
            <span className="block text-sm font-medium">{t("products.fields.isActive")}</span>
            <span className="block text-xs text-slate-500">{t("products.modal.isActiveHint")}</span>
          </span>
          <Form.Item name="isActive" valuePropName="checked" noStyle>
            <Switch />
          </Form.Item>
        </label>
        <label className="flex items-center justify-between gap-3">
          <span>
            <span className="block text-sm font-medium">{t("products.fields.purchasable")}</span>
            <span className="block text-xs text-slate-500">
              {t("products.modal.purchasableHint")}
            </span>
          </span>
          <Form.Item name="purchasable" valuePropName="checked" noStyle>
            <Switch />
          </Form.Item>
        </label>
      </div>
    </Card>
  );
}
