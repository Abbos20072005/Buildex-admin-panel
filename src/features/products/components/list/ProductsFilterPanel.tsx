import { CloseIcon } from "@/shared/icons";
import { Button, Card, DatePicker, Form, InputNumber, Select, Space } from "antd";
import dayjs from "dayjs";
import { useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { useDebouncedValue } from "@/shared/lib/useDebouncedValue";
import { useBadgesQuery, useBrandsQuery, useCategoriesQuery } from "../../hooks/queries";
import type { ProductFilterPatch, ProductListState } from "../../hooks/useProductListState";
import { UNITS } from "../../model/constants";
import type { ProductFilters } from "../../model/types";

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <Form.Item label={label} className="mb-0">
      {children}
    </Form.Item>
  );
}

type BoolKey = "inStock" | "hasDiscount" | "purchasable" | "erpActive";

/** "Yes / No" select for a boolean API filter. */
function BoolSelect({
  name,
  filters,
  onChange,
}: {
  name: BoolKey;
  filters: ProductFilters;
  onChange: (patch: ProductFilterPatch) => void;
}) {
  const { t } = useTranslation();
  return (
    <Select<"1" | "0">
      allowClear
      placeholder={t("common.all")}
      value={filters[name] === undefined ? undefined : filters[name] ? "1" : "0"}
      options={[
        { value: "1", label: t(`products.filter.${name}Yes`) },
        { value: "0", label: t(`products.filter.${name}No`) },
      ]}
      onChange={(value) => onChange({ [name]: value === undefined ? null : value === "1" })}
    />
  );
}

export function ProductsFilterPanel({ state }: { state: ProductListState }) {
  const { t } = useTranslation();
  const { filters, setFilter, setDateRange, resetFilters, activeFilterCount } = state;

  const [brandSearch, setBrandSearch] = useState("");
  const { data: categories = [] } = useCategoriesQuery();
  const { data: badges = [] } = useBadgesQuery();
  const brands = useBrandsQuery(useDebouncedValue(brandSearch, 300));

  return (
    <Card size="small" className="mb-4">
      <Form
        layout="vertical"
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5"
      >
        <Field label={t("products.filter.category")}>
          <Select
            allowClear
            showSearch={{ optionFilterProp: "label" }}
            placeholder={t("common.all")}
            value={filters.category}
            options={categories.map((item) => ({ value: item.id, label: item.name }))}
            onChange={(value) => setFilter({ category: value })}
          />
        </Field>

        <Field label={t("products.filter.brand")}>
          <Select
            allowClear
            showSearch={{ filterOption: false, onSearch: setBrandSearch }}
            placeholder={t("common.all")}
            value={filters.brand}
            loading={brands.isFetching}
            options={(brands.data ?? []).map((item) => ({ value: item.id, label: item.name }))}
            onChange={(value) => {
              setBrandSearch("");
              setFilter({ brand: value });
            }}
          />
        </Field>

        <Field label={t("products.filter.stock")}>
          <BoolSelect name="inStock" filters={filters} onChange={setFilter} />
        </Field>

        <Field label={t("products.filter.discount")}>
          <BoolSelect name="hasDiscount" filters={filters} onChange={setFilter} />
        </Field>

        <Field label={t("products.filter.purchasable")}>
          <BoolSelect name="purchasable" filters={filters} onChange={setFilter} />
        </Field>

        <Field label={t("products.filter.erp")}>
          <BoolSelect name="erpActive" filters={filters} onChange={setFilter} />
        </Field>

        <Field label={t("products.filter.badge")}>
          <Select
            allowClear
            placeholder={t("common.all")}
            value={filters.badge}
            options={badges.map((item) => ({ value: item.id, label: item.name }))}
            onChange={(value) => setFilter({ badge: value })}
          />
        </Field>

        <Field label={t("products.filter.unit")}>
          <Select
            allowClear
            placeholder={t("common.all")}
            value={filters.unit}
            options={UNITS.map((unit) => ({ value: unit, label: t(`unit.${unit}`) }))}
            onChange={(value) => setFilter({ unit: value })}
          />
        </Field>

        <Field label={t("products.filter.price")}>
          <Space.Compact block>
            <InputNumber<number>
              className="w-1/2"
              min={0}
              step={10_000}
              placeholder={t("common.from")}
              value={filters.minPrice}
              onChange={(value) => setFilter({ minPrice: value })}
            />
            <InputNumber<number>
              className="w-1/2"
              min={0}
              step={10_000}
              placeholder={t("common.to")}
              value={filters.maxPrice}
              onChange={(value) => setFilter({ maxPrice: value })}
            />
          </Space.Compact>
        </Field>

        <Field label={t("products.filter.created")}>
          <DatePicker.RangePicker
            className="w-full"
            format="DD.MM.YYYY"
            value={filters.from && filters.to ? [dayjs(filters.from), dayjs(filters.to)] : null}
            onChange={(range) => setDateRange(range?.[0] && range[1] ? [range[0], range[1]] : null)}
          />
        </Field>

        {activeFilterCount > 0 && (
          <div className="flex items-end">
            <Button icon={<CloseIcon />} onClick={resetFilters}>
              {t("common.reset")}
            </Button>
          </div>
        )}
      </Form>
    </Card>
  );
}
