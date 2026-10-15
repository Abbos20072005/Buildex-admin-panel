import { Card, Form, Tabs } from "antd";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { LINK_KINDS, type LinkKind, type ProductDetail } from "../../model/types";
import type { ProductFormValues } from "./form";
import { LinkedProductsField } from "./LinkedProductsField";

/** Related / alternative / cross-sell products — saved together with the rest of the form. */
export function ProductLinksCard({ product }: { product: ProductDetail }) {
  const { t } = useTranslation();
  const [kind, setKind] = useState<LinkKind>("related");
  const values = Form.useWatch<ProductFormValues["links"] | undefined>("links");

  return (
    <Card title={t("products.links.title")}>
      <Tabs
        activeKey={kind}
        onChange={(key) => setKind(key as LinkKind)}
        className="[&_.ant-tabs-nav]:mb-3"
        items={LINK_KINDS.map((item) => ({
          key: item,
          label: (
            <span className="inline-flex items-center gap-2">
              {t(`products.links.${item}`)}
              <span className="min-w-6 rounded-md bg-slate-100 px-1.5 text-center text-xs leading-5 font-semibold text-slate-600">
                {values?.[item]?.length ?? product.links[item].length}
              </span>
            </span>
          ),
        }))}
      />
      <p className="mt-0 mb-3 text-xs text-slate-500">
        {t(`products.links.${kind}Hint`)} {t("products.links.oneWay")}
      </p>
      {/* every kind stays mounted: a server error on a hidden one still lands on its field */}
      {LINK_KINDS.map((item) => (
        <Form.Item key={item} name={["links", item]} className={item === kind ? "mb-0" : "hidden"}>
          <LinkedProductsField productId={product.id} />
        </Form.Item>
      ))}
    </Card>
  );
}
