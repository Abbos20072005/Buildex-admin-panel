import { Card, Form, InputNumber, Select, Switch } from "antd";
import { useTranslation } from "react-i18next";
import { UNITS } from "../../model/constants";
import type { ProductCreateValues } from "./form";

/** 1 500 000 — spaces between the thousands while typing, plain digits in the form */
const groupThousands = (value: string | number | undefined) =>
  `${value ?? ""}`.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
const ungroup = (value: string | undefined) => (value ?? "").replace(/\s/g, "");

/** Price, discount, unit and stock of a new product. */
export function ProductPricingCard() {
  const { t } = useTranslation();
  const form = Form.useFormInstance<ProductCreateValues>();

  return (
    <Card title={t("products.create.pricing")}>
      <div className="grid gap-x-4 sm:grid-cols-2">
        <Form.Item
          name="price"
          label={t("products.fields.price")}
          rules={[{ type: "number", min: 0 }]}
        >
          <InputNumber
            className="w-full"
            min={0}
            controls={false}
            formatter={groupThousands}
            parser={ungroup}
          />
        </Form.Item>

        <Form.Item
          name="discountPrice"
          label={t("products.fields.discountPrice")}
          dependencies={["price"]}
          extra={t("products.create.discountPriceHint")}
          rules={[
            {
              validator: (_rule, value: number | null) => {
                const price = form.getFieldValue("price") as number | null;
                return value != null && price != null && value > price
                  ? Promise.reject(new Error(t("products.create.discountTooBig")))
                  : Promise.resolve();
              },
            },
          ]}
        >
          <InputNumber
            className="w-full"
            min={0}
            controls={false}
            formatter={groupThousands}
            parser={ungroup}
          />
        </Form.Item>

        <Form.Item
          name="discount"
          label={t("products.create.discountPercent")}
          rules={[{ type: "number", min: 0, max: 100 }]}
        >
          <InputNumber className="w-full" min={0} max={100} precision={0} addonAfter="%" />
        </Form.Item>

        <Form.Item name="unit" label={t("products.fields.unit")}>
          <Select options={UNITS.map((unit) => ({ value: unit, label: t(`unit.${unit}`) }))} />
        </Form.Item>

        <Form.Item name="quantity" label={t("products.create.quantity")} className="mb-0">
          <InputNumber className="w-full" min={0} precision={0} />
        </Form.Item>
      </div>

      <label className="mt-4 flex items-center justify-between gap-3 border-t border-slate-100 pt-3">
        <span>
          <span className="block text-sm font-medium">{t("products.create.onOrder")}</span>
          <span className="block text-xs text-slate-500">{t("products.create.onOrderHint")}</span>
        </span>
        <Form.Item name="onOrder" valuePropName="checked" noStyle>
          <Switch />
        </Form.Item>
      </label>
    </Card>
  );
}
