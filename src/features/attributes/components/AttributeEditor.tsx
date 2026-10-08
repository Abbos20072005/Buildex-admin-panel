import { CloseIcon, PlusIcon } from "@/shared/icons";
import { App, Button, Card, Form, Input, Popconfirm, Segmented, Switch } from "antd";
import { useTranslation } from "react-i18next";
import { getErrorMessage } from "@/shared/api";
import { useEditorForm } from "@/shared/form";
import { useCreateAttribute, useDeleteAttribute, useUpdateAttribute } from "../hooks/queries";
import { VALUE_TYPES } from "../model/constants";
import type { Attribute, AttributeInput } from "../model/types";
import { ValueTypeTag } from "./AttributeBits";

interface Props {
  /** null — a new attribute is being created */
  attribute: Attribute | null;
  onClose: () => void;
  /** after a successful create / update */
  onSaved: (attribute: Attribute) => void;
}

const emptyInput = (): AttributeInput => ({
  names: { uz: "", ru: "" },
  valueType: "list",
  unit: "",
  options: [{ uz: "", ru: "" }],
  isFilterable: false,
  isActive: true,
});

const toInput = (attribute: Attribute): AttributeInput => ({
  names: { ...attribute.names },
  valueType: attribute.valueType,
  unit: attribute.unit,
  options: attribute.options.map((option) => ({ ...option })),
  isFilterable: attribute.isFilterable,
  isActive: attribute.isActive,
});

/**
 * Side panel: create / edit one attribute. The form is remounted (`key`) for every attribute,
 * so it always starts from the saved values.
 */
export function AttributeEditor({ attribute, onClose, onSaved }: Props) {
  const { t } = useTranslation();
  const { message } = App.useApp();
  const [form] = Form.useForm<AttributeInput>();
  const guard = useEditorForm(form);
  const valueType = Form.useWatch("valueType", form) ?? attribute?.valueType ?? "list";

  const create = useCreateAttribute();
  const update = useUpdateAttribute();
  const remove = useDeleteAttribute();
  const saving = create.isPending || update.isPending;

  // the backend refuses to change the type or delete an attribute that is already used
  const used = !!attribute && (attribute.categoriesCount > 0 || attribute.productsCount > 0);

  const handleSave = async () => {
    try {
      await form.validateFields();
    } catch {
      return;
    }
    const input = form.getFieldsValue(true) as AttributeInput;
    const done = {
      onSuccess: (saved: Attribute) => {
        message.success(t("attributes.saved"));
        onSaved(saved);
      },
      onError: guard.showError,
    };
    if (attribute) update.mutate({ id: attribute.id, input }, done);
    else create.mutate(input, done);
  };

  const handleDelete = () => {
    if (!attribute) return;
    remove.mutate(attribute.id, {
      onSuccess: () => {
        message.success(t("attributes.deleted"));
        guard.saved();
        onClose();
      },
      onError: (err) => message.error(getErrorMessage(err)),
    });
  };

  return (
    <Card
      className="sticky top-20"
      styles={{ body: { padding: 0 } }}
      title={
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="truncate text-base font-bold">
              {attribute ? attribute.names.uz || attribute.name : t("attributes.newTitle")}
            </div>
            <div className="mt-0.5 flex items-center gap-1.5 text-xs font-normal text-slate-500">
              {t("attributes.entity")}
              {attribute && (
                <>
                  <span>·</span>
                  <ValueTypeTag type={attribute.valueType} />
                </>
              )}
            </div>
          </div>
          <Button
            type="text"
            icon={<CloseIcon />}
            onClick={() => guard.confirmClose(onClose)}
            aria-label={t("common.cancel")}
          />
        </div>
      }
    >
      <Form
        form={form}
        {...guard.formProps}
        disabled={saving}
        layout="vertical"
        requiredMark={false}
        initialValues={attribute ? toInput(attribute) : emptyInput()}
        className="max-h-[calc(100vh-17rem)] overflow-y-auto px-5 py-4"
      >
        <div className="grid grid-cols-2 gap-3">
          <Form.Item
            name={["names", "uz"]}
            label={<Required>{t("attributes.nameUz")}</Required>}
            rules={[{ required: true, whitespace: true, message: t("attributes.required") }]}
          >
            <Input maxLength={150} />
          </Form.Item>
          <Form.Item
            name={["names", "ru"]}
            label={<Required>{t("attributes.nameRu")}</Required>}
            rules={[{ required: true, whitespace: true, message: t("attributes.required") }]}
          >
            <Input maxLength={150} />
          </Form.Item>
        </div>

        <Form.Item
          name="valueType"
          label={<Required>{t("attributes.valueType")}</Required>}
          extra={used ? t("attributes.typeLocked") : undefined}
        >
          <Segmented
            block
            disabled={used}
            options={VALUE_TYPES.map((type) => ({
              value: type,
              label: t(`attributes.types.${type}`),
            }))}
          />
        </Form.Item>

        {valueType === "number" && (
          <Form.Item
            name="unit"
            label={<Required>{t("attributes.unit")}</Required>}
            rules={[{ required: true, whitespace: true, message: t("attributes.required") }]}
          >
            <Input maxLength={50} placeholder="t, kg, m, kVt…" className="max-w-48" />
          </Form.Item>
        )}

        {valueType === "list" && (
          <Form.Item label={<Required>{t("attributes.options")}</Required>} className="mb-4">
            <Form.List
              name="options"
              rules={[
                {
                  validator: async (_, options: AttributeInput["options"] | undefined) => {
                    if (!options?.length) throw new Error(t("attributes.optionsRequired"));
                    const seen = new Set<string>();
                    for (const option of options) {
                      const key = option?.uz?.trim().toLowerCase();
                      if (key && seen.has(key)) throw new Error(t("attributes.optionsUnique"));
                      if (key) seen.add(key);
                    }
                  },
                },
              ]}
            >
              {(fields, { add, remove: removeOption }, { errors }) => (
                <>
                  <div className="mb-1 grid grid-cols-[1fr_1fr_24px] gap-2 text-xs font-semibold text-slate-500">
                    <span>UZ</span>
                    <span>RU</span>
                  </div>
                  {fields.map((field) => (
                    <div key={field.key} className="mb-2 grid grid-cols-[1fr_1fr_24px] gap-2">
                      <Form.Item
                        name={[field.name, "uz"]}
                        noStyle
                        rules={[{ required: true, whitespace: true, message: "" }]}
                      >
                        <Input maxLength={255} />
                      </Form.Item>
                      <Form.Item
                        name={[field.name, "ru"]}
                        noStyle
                        rules={[{ required: true, whitespace: true, message: "" }]}
                      >
                        <Input maxLength={255} />
                      </Form.Item>
                      <Button
                        type="text"
                        size="small"
                        icon={<CloseIcon />}
                        disabled={fields.length === 1}
                        onClick={() => removeOption(field.name)}
                        aria-label={t("common.delete")}
                      />
                    </div>
                  ))}
                  <Button
                    type="link"
                    className="px-0"
                    icon={<PlusIcon />}
                    onClick={() => add({ uz: "", ru: "" })}
                  >
                    {t("attributes.addOption")}
                  </Button>
                  <Form.ErrorList errors={errors} />
                </>
              )}
            </Form.List>
          </Form.Item>
        )}

        <div className="mt-2 border-t border-slate-100 pt-4">
          <div className="mb-3 font-semibold">{t("attributes.usage")}</div>
          <div className="space-y-3">
            <label className="flex items-center justify-between gap-3">
              <span>
                <span className="block text-sm font-medium">{t("attributes.filterable")}</span>
                <span className="block text-xs text-slate-500">
                  {t("attributes.filterableHint")}
                </span>
              </span>
              <Form.Item name="isFilterable" valuePropName="checked" noStyle>
                <Switch />
              </Form.Item>
            </label>
            <label className="flex items-center justify-between gap-3">
              <span>
                <span className="block text-sm font-medium">{t("attributes.activeLabel")}</span>
                <span className="block text-xs text-slate-500">{t("attributes.activeHint")}</span>
              </span>
              <Form.Item name="isActive" valuePropName="checked" noStyle>
                <Switch />
              </Form.Item>
            </label>
          </div>

          {attribute && (
            <div className="mt-4">
              <div className="mb-1.5 text-sm font-medium">{t("attributes.categories")}</div>
              {attribute.categories.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {attribute.categories.map((category) => (
                    <span
                      key={category.id}
                      title={category.path}
                      className="rounded-md bg-slate-100 px-2 py-0.5 text-xs text-slate-700"
                    >
                      {category.name}
                    </span>
                  ))}
                </div>
              ) : (
                <span className="text-xs text-slate-500">{t("attributes.noCategories")}</span>
              )}
              <p className="m-0 mt-2 text-xs text-slate-500">
                {t("attributes.productsCount", { count: attribute.productsCount })}
              </p>
            </div>
          )}
        </div>
      </Form>

      <div className="flex items-center justify-between gap-3 border-t border-slate-100 px-5 py-3">
        <div className="flex min-w-0 items-center gap-3">
          {attribute && (
            <Popconfirm
              title={t("attributes.deleteConfirm")}
              okText={t("common.delete")}
              okButtonProps={{ danger: true }}
              cancelText={t("common.cancel")}
              disabled={used}
              onConfirm={handleDelete}
            >
              <Button danger disabled={used} loading={remove.isPending}>
                {t("common.delete")}
              </Button>
            </Popconfirm>
          )}
          {used && attribute && (
            <span className="text-xs leading-tight text-slate-500">
              {t("attributes.usedHint", { count: attribute.categoriesCount })}
            </span>
          )}
        </div>
        <div className="flex shrink-0 gap-2">
          <Button onClick={() => guard.confirmClose(onClose)}>{t("common.cancel")}</Button>
          <Button type="primary" loading={saving} onClick={() => void handleSave()}>
            {t("attributes.save")}
          </Button>
        </div>
      </div>
    </Card>
  );
}

function Required({ children }: { children: string }) {
  return (
    <>
      {children} <span className="text-red-600">*</span>
    </>
  );
}
