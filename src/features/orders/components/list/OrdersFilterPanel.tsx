import { CloseIcon } from "@/shared/icons";
import { Button, Card, DatePicker, Form, InputNumber, Select, Space } from "antd";
import dayjs, { type Dayjs } from "dayjs";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { useBranchesQuery } from "../../hooks/queries";
import type { OrderListState } from "../../hooks/useOrderListState";
import { PAY_STATUSES, PAY_TYPES } from "../../model/constants";
import type { Fulfillment } from "../../model/types";

const FULFILLMENTS: Fulfillment[] = ["delivery", "pickup"];

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <Form.Item label={label} className="mb-0">
      {children}
    </Form.Item>
  );
}

export function OrdersFilterPanel({ state }: { state: OrderListState }) {
  const { t } = useTranslation();
  const { data: branches = [] } = useBranchesQuery();
  const { filters, setFilter, setDateRange, resetFilters, activeFilterCount } = state;

  const today = dayjs();
  const datePresets: { label: string; value: [Dayjs, Dayjs] }[] = [
    { label: t("orders.datePresets.today"), value: [today, today] },
    {
      label: t("orders.datePresets.yesterday"),
      value: [today.subtract(1, "day"), today.subtract(1, "day")],
    },
    { label: t("orders.datePresets.week"), value: [today.subtract(6, "day"), today] },
    { label: t("orders.datePresets.month"), value: [today.subtract(29, "day"), today] },
  ];

  const optionsOf = (prefix: string, values: readonly string[]) =>
    values.map((value) => ({ value, label: t(`${prefix}.${value}`) }));

  return (
    <Card size="small" className="mb-4">
      <Form
        layout="vertical"
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6"
      >
        <div className="sm:col-span-2 xl:col-span-2">
          <Field label={t("orders.filter.date")}>
            <DatePicker.RangePicker
              className="w-full"
              format="DD.MM.YYYY"
              presets={datePresets}
              value={filters.from && filters.to ? [dayjs(filters.from), dayjs(filters.to)] : null}
              onChange={(range) =>
                setDateRange(range?.[0] && range[1] ? [range[0], range[1]] : null)
              }
            />
          </Field>
        </div>

        <Field label={t("orders.filter.payType")}>
          <Select
            allowClear
            placeholder={t("common.all")}
            value={filters.payType}
            options={optionsOf("payType", PAY_TYPES)}
            onChange={(value) => setFilter({ payType: value })}
          />
        </Field>

        <Field label={t("orders.filter.payStatus")}>
          <Select
            allowClear
            placeholder={t("common.all")}
            value={filters.payStatus}
            options={optionsOf("payStatus", PAY_STATUSES)}
            onChange={(value) => setFilter({ payStatus: value })}
          />
        </Field>

        <Field label={t("orders.filter.fulfillment")}>
          <Select
            allowClear
            placeholder={t("common.all")}
            value={filters.fulfillment}
            options={optionsOf("fulfillment", FULFILLMENTS)}
            onChange={(value) => setFilter({ fulfillment: value })}
          />
        </Field>

        <Field label={t("orders.filter.branch")}>
          <Select
            allowClear
            showSearch={{ optionFilterProp: "label" }}
            placeholder={t("common.all")}
            value={filters.branch}
            options={branches.map((branch) => ({ value: branch.id, label: branch.name }))}
            onChange={(value) => setFilter({ branch: value })}
          />
        </Field>

        <div className="sm:col-span-2 xl:col-span-2">
          <Field label={t("orders.filter.amount")}>
            <Space.Compact block>
              <InputNumber<number>
                className="w-1/2"
                min={0}
                step={100_000}
                placeholder={t("common.from")}
                value={filters.minTotal}
                onChange={(value) => setFilter({ minTotal: value })}
              />
              <InputNumber<number>
                className="w-1/2"
                min={0}
                step={100_000}
                placeholder={t("common.to")}
                value={filters.maxTotal}
                onChange={(value) => setFilter({ maxTotal: value })}
              />
            </Space.Compact>
          </Field>
        </div>

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
