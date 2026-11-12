import { Card, Form, Input } from "antd";
import { useTranslation } from "react-i18next";

/** up to 3 digits after the point: "2.900" */
const DECIMAL = /^\d{1,6}(\.\d{1,3})?$/;

function SizeField({ name, label }: { name: string; label: string }) {
  const { t } = useTranslation();
  return (
    <Form.Item
      name={name}
      label={label}
      rules={[{ pattern: DECIMAL, message: t("products.create.decimalHint") }]}
    >
      <Input inputMode="decimal" maxLength={10} />
    </Form.Item>
  );
}

/** Article, barcode, weight and size of a new product (the 1C code is never typed here). */
export function ProductSpecsCard() {
  const { t } = useTranslation();

  return (
    <Card title={t("products.create.specs")}>
      <div className="grid gap-x-4 sm:grid-cols-2">
        <Form.Item name="articul" label={t("products.fields.articul")}>
          <Input maxLength={100} />
        </Form.Item>
        <Form.Item name="barcode" label={t("products.fields.barcode")}>
          <Input maxLength={100} />
        </Form.Item>
      </div>

      <div className="grid gap-x-4 sm:grid-cols-4">
        <SizeField name="weight" label={`${t("products.fields.weight")}, ${t("unit.kg")}`} />
        <SizeField name="length" label={`${t("products.create.length")}, ${t("unit.m")}`} />
        <SizeField name="width" label={`${t("products.create.width")}, ${t("unit.m")}`} />
        <SizeField name="height" label={`${t("products.create.height")}, ${t("unit.m")}`} />
      </div>
      <p className="m-0 text-xs text-slate-500">{t("products.create.specsHint")}</p>
    </Card>
  );
}
