import { CloseIcon, FilterIcon } from "@/shared/icons";
import { Button, Card, Empty, Form, Input, Select, Switch, Tooltip } from "antd";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useAttributesQuery } from "../../hooks/queries";
import { emptyAttributeValue } from "../../lib/characteristics";
import type { AttributeValue, ProductAttribute } from "../../model/types";

const TYPE_LABEL = {
  number: "products.modal.typeNumber",
  list: "products.modal.typeList",
  text: "products.modal.typeText",
  boolean: "products.modal.typeBoolean",
} as const;

interface RowProps {
  index: number;
  row: AttributeValue | undefined;
  /** full attribute from the category (options, filter flag); the row's own copy is a fallback */
  attribute: ProductAttribute | undefined;
  onRemove: () => void;
}

function AttributeRow({ index, row, attribute, onRemove }: RowProps) {
  const { t } = useTranslation();
  const form = Form.useFormInstance();
  const meta = attribute ?? row?.attribute;
  if (!meta) return null;

  const path = (lang: "uz" | "ru") => ["attributeValues", index, lang];
  const setBoth = (uz: string, ru: string) => {
    form.setFieldValue(path("uz"), uz);
    form.setFieldValue(path("ru"), ru);
  };

  const options = attribute?.options ?? row?.attribute.options ?? [];
  const isFilterable = attribute?.isFilterable ?? row?.attribute.isFilterable;

  let uzCell;
  let ruCell;
  switch (meta.valueType) {
    case "number":
      uzCell = (
        <Form.Item name={[index, "uz"]} noStyle>
          <Input
            inputMode="decimal"
            maxLength={30}
            onChange={(event) => form.setFieldValue(path("ru"), event.target.value)}
          />
        </Form.Item>
      );
      ruCell = <Input disabled placeholder={t("products.modal.sameInBoth")} />;
      break;
    case "list":
      uzCell = (
        <Form.Item name={[index, "ru"]} noStyle>
          <Select
            className="w-full"
            placeholder={t("products.modal.choose")}
            options={options.map((option) => ({ value: option.ru, label: option.uz }))}
            onChange={(ru: string) =>
              form.setFieldValue(path("uz"), options.find((option) => option.ru === ru)?.uz ?? "")
            }
          />
        </Form.Item>
      );
      ruCell = (
        <Form.Item name={[index, "ru"]} noStyle>
          <Input disabled />
        </Form.Item>
      );
      break;
    case "boolean":
      uzCell = (
        <Form.Item
          name={[index, "ru"]}
          noStyle
          getValueProps={(value: string) => ({ checked: value === "true" })}
          getValueFromEvent={(checked: boolean) => String(checked)}
        >
          <Switch onChange={(checked) => setBoth(String(checked), String(checked))} />
        </Form.Item>
      );
      ruCell = null;
      break;
    default:
      uzCell = (
        <Form.Item name={[index, "uz"]} noStyle>
          <Input maxLength={255} />
        </Form.Item>
      );
      ruCell = (
        <Form.Item name={[index, "ru"]} noStyle>
          <Input maxLength={255} />
        </Form.Item>
      );
  }

  return (
    <tr className="border-t border-slate-100 align-top">
      <td className="px-4 py-2.5">
        <div className="font-semibold">
          {meta.name}
          {isFilterable && (
            <Tooltip title={t("products.modal.filterHint")}>
              <FilterIcon className="ml-1.5 text-xs text-brand" />
            </Tooltip>
          )}
        </div>
        <div className="text-xs text-slate-400">{t(TYPE_LABEL[meta.valueType])}</div>
      </td>
      <td className="px-2 py-2.5">{uzCell}</td>
      <td className="px-2 py-2.5">{ruCell}</td>
      <td className="px-2 py-2.5">
        {meta.unit ? (
          <span className="inline-block rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">
            {meta.unit}
          </span>
        ) : (
          <span className="text-slate-300">—</span>
        )}
      </td>
      <td className="py-2.5 pr-3 text-right">
        <Button
          type="text"
          icon={<CloseIcon />}
          onClick={onRemove}
          aria-label={t("products.modal.charRemove")}
        />
      </td>
    </tr>
  );
}

/**
 * Attributes (xususiyatlar) of the product. The list to choose from is the attributes attached
 * to the product's category (GET /admin/item-categories/{id}/attributes/); the admin picks one
 * and fills in the value in the form that fits its type.
 */
export function ProductCharacteristicsCard() {
  const { t } = useTranslation();
  const form = Form.useFormInstance();
  const rows = Form.useWatch<AttributeValue[] | undefined>("attributeValues", {
    form,
    preserve: true,
  });
  const categoryId = Form.useWatch<number | null | undefined>("categoryId", {
    form,
    preserve: true,
  });
  const attributes = useAttributesQuery(categoryId);

  const available = useMemo(() => {
    const used = new Set((rows ?? []).map((row) => row.attribute.id));
    return (attributes.data ?? []).filter((attribute) => !used.has(attribute.id));
  }, [attributes.data, rows]);

  const hint = !categoryId
    ? t("products.modal.charNoCategory")
    : attributes.data?.length === 0
      ? t("products.modal.categoryNoAttributes")
      : t("products.modal.charHint");

  return (
    <Card
      title={
        <>
          {t("products.modal.characteristics")}{" "}
          <span className="font-normal text-slate-400">· {rows?.length ?? 0}</span>
        </>
      }
      styles={{ body: { padding: 0 } }}
    >
      <Form.List name="attributeValues">
        {(fields, { add, remove }) => (
          <>
            {fields.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px] border-collapse text-sm">
                  <thead>
                    <tr className="bg-surface-alt text-left text-xs font-semibold tracking-wide text-slate-500 uppercase">
                      <th className="px-4 py-2.5 font-semibold">{t("products.modal.charName")}</th>
                      <th className="w-56 px-2 py-2.5 font-semibold">
                        {t("products.modal.valueUz")}
                      </th>
                      <th className="w-56 px-2 py-2.5 font-semibold">
                        {t("products.modal.valueRu")}
                      </th>
                      <th className="w-24 px-2 py-2.5 font-semibold">
                        {t("products.modal.charUnit")}
                      </th>
                      <th className="w-12" />
                    </tr>
                  </thead>
                  <tbody>
                    {fields.map((field) => {
                      const row = rows?.[field.name];
                      return (
                        <AttributeRow
                          key={field.key}
                          index={field.name}
                          row={row}
                          attribute={attributes.data?.find((item) => item.id === row?.attribute.id)}
                          onRemove={() => remove(field.name)}
                        />
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={t("products.modal.noCharacteristics")}
                className="py-4"
              />
            )}

            <div className="border-t border-slate-100 px-4 py-3">
              <Select
                className="w-full max-w-xs"
                showSearch={{ optionFilterProp: "label" }}
                value={null}
                placeholder={`+ ${t("products.modal.charAdd")}`}
                disabled={!categoryId}
                loading={attributes.isFetching}
                options={available.map((attribute) => ({
                  value: attribute.id,
                  label: attribute.name,
                }))}
                notFoundContent={t("products.modal.noAttributes")}
                onSelect={(id) => {
                  const attribute = available.find((item) => item.id === id);
                  if (attribute) add(emptyAttributeValue(attribute));
                }}
              />
              <p className="m-0 mt-2 text-xs text-slate-500">{hint}</p>
            </div>
          </>
        )}
      </Form.List>
    </Card>
  );
}
