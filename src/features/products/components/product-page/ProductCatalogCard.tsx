import { Card, Form, Select } from "antd";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useDebouncedValue } from "@/shared/lib/useDebouncedValue";
import {
  useBadgesQuery,
  useBrandsQuery,
  useItemCategoriesQuery,
  useManualBadgesQuery,
  useProductModelsQuery,
} from "../../hooks/queries";
import type { NamedRef, ProductDetail } from "../../model/types";

/** Options from the API plus the product's current value (it may not be on the first page). */
function withCurrent<T extends NamedRef>(
  options: T[],
  current: T | null,
  label: (item: T) => string,
) {
  const list =
    current && !options.some((item) => item.id === current.id) ? [current, ...options] : options;
  return list.map((item) => ({ value: item.id, label: label(item) }));
}

interface Props {
  product: ProductDetail;
  /**
   * A new product: it also takes the model of the brand, and only the hand-set badges (the
   * automatic ones are given by their own rule).
   */
  creating?: boolean;
}

/** Where the product lives on the site: item category, brand, model and badge. */
export function ProductCatalogCard({ product, creating = false }: Props) {
  const { t } = useTranslation();
  const form = Form.useFormInstance();
  const [categorySearch, setCategorySearch] = useState("");
  const [brandSearch, setBrandSearch] = useState("");
  const brandId = Form.useWatch<number | null | undefined>("brandId", { form, preserve: true });

  const categories = useItemCategoriesQuery(useDebouncedValue(categorySearch, 300));
  const brands = useBrandsQuery(useDebouncedValue(brandSearch, 300));
  const models = useProductModelsQuery(creating ? brandId : null);
  const allBadges = useBadgesQuery();
  const manualBadges = useManualBadgesQuery(creating);
  const badges = (creating ? manualBadges.data : allBadges.data) ?? [];

  const categoryOptions = useMemo(
    () => withCurrent(categories.data ?? [], product.category, (item) => item.path || item.name),
    [categories.data, product.category],
  );
  const brandOptions = useMemo(
    () => withCurrent(brands.data ?? [], product.brand, (item) => item.name),
    [brands.data, product.brand],
  );

  return (
    <Card title={t("products.modal.catalog")}>
      <Form.Item name="categoryId" label={t("products.fields.category")}>
        <Select
          allowClear
          showSearch={{ filterOption: false, onSearch: setCategorySearch }}
          loading={categories.isFetching}
          options={categoryOptions}
          placeholder={t("products.modal.choose")}
          onChange={() => {
            setCategorySearch("");
            // attributes belong to the category — the old values don't fit the new one
            form.setFieldValue("attributeValues", []);
          }}
        />
      </Form.Item>

      <Form.Item name="brandId" label={t("products.fields.brand")}>
        <Select
          allowClear
          showSearch={{ filterOption: false, onSearch: setBrandSearch }}
          loading={brands.isFetching}
          options={brandOptions}
          placeholder={t("products.modal.choose")}
          onChange={() => {
            setBrandSearch("");
            // a model belongs to one brand
            if (creating) form.setFieldValue("modelId", null);
          }}
        />
      </Form.Item>

      {creating && (
        <Form.Item name="modelId" label={t("products.create.model")}>
          <Select
            allowClear
            showSearch={{ optionFilterProp: "label" }}
            disabled={!brandId}
            loading={models.isFetching}
            options={(models.data ?? []).map((item) => ({ value: item.id, label: item.name }))}
            placeholder={
              brandId ? t("products.modal.choose") : t("products.create.modelNeedsBrand")
            }
            notFoundContent={t("products.create.noModels")}
          />
        </Form.Item>
      )}

      <Form.Item name="badgeId" label={t("products.fields.badge")} className="mb-0">
        <Select
          allowClear
          options={withCurrent(badges, product.badge, (item) => item.name)}
          placeholder={t("products.modal.choose")}
        />
      </Form.Item>
    </Card>
  );
}
