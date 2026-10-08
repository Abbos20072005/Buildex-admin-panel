import { CloseIcon } from "@/shared/icons";
import { App, Button, Card, Form, Input, Popconfirm, Select } from "antd";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useBrandsListQuery } from "@/features/brands";
import { getErrorMessage } from "@/shared/api";
import { useEditorForm } from "@/shared/form";
import { useDebouncedValue } from "@/shared/lib/useDebouncedValue";
import { useCreateModel, useDeleteModel, useUpdateModel } from "../hooks/queries";
import type { ProductModel, ProductModelInput } from "../model/types";

interface Props {
  /** null — a new model is being created */
  model: ProductModel | null;
  onClose: () => void;
}

const emptyInput = (): ProductModelInput => ({
  name: "",
  brandId: null,
  // a new model starts as a draft
  isActive: false,
});

const toInput = (model: ProductModel): ProductModelInput => ({
  name: model.name,
  brandId: model.brand?.id ?? null,
  isActive: model.isActive,
});

/**
 * Side panel: create / edit one model. The form is remounted (`key`) for every model, so it
 * always starts from the saved values.
 */
export function ModelEditor({ model, onClose }: Props) {
  const { t } = useTranslation();
  const { message } = App.useApp();
  const [form] = Form.useForm<ProductModelInput>();
  const guard = useEditorForm(form);
  const [brandSearch, setBrandSearch] = useState("");

  const brands = useBrandsListQuery({
    filters: { search: useDebouncedValue(brandSearch, 300) },
    page: 1,
    pageSize: 50,
  });

  const create = useCreateModel();
  const update = useUpdateModel();
  const remove = useDeleteModel();
  const saving = create.isPending || update.isPending;

  // a model with products keeps its brand and can't be deleted (deactivate it instead)
  const hasProducts = (model?.productsCount ?? 0) > 0;

  const brandOptions = useMemo(() => {
    const list = (brands.data?.items ?? []).map((brand) => ({
      value: brand.id,
      label: brand.name,
    }));
    // the current brand may be missing from the first page of the list
    return model?.brand && !list.some((option) => option.value === model.brand?.id)
      ? [{ value: model.brand.id, label: model.brand.name }, ...list]
      : list;
  }, [brands.data, model]);

  const handleSave = async () => {
    try {
      await form.validateFields();
    } catch {
      return;
    }
    const input = form.getFieldsValue(true) as ProductModelInput;
    if (input.brandId === null) return;
    const valid = { ...input, brandId: input.brandId };
    const done = {
      onSuccess: () => {
        message.success(t("models.saved"));
        guard.saved();
        onClose();
      },
      onError: guard.showError,
    };
    if (model) update.mutate({ id: model.id, input: valid }, done);
    else create.mutate(valid, done);
  };

  const handleDelete = () => {
    if (!model) return;
    remove.mutate(model.id, {
      onSuccess: () => {
        message.success(t("models.deleted"));
        guard.saved();
        onClose();
      },
      onError: (err) => message.error(getErrorMessage(err)),
    });
  };

  const required = (label: string) => (
    <>
      {label} <span className="text-red-600">*</span>
    </>
  );

  return (
    <Card
      className="sticky top-20"
      styles={{ body: { padding: 0 } }}
      title={
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="truncate text-base font-bold">
              {model ? model.name : t("models.newTitle")}
            </div>
            <div className="mt-0.5 text-xs font-normal text-slate-500">
              {model
                ? t("models.subtitle", { count: model.productsCount })
                : t("models.newSubtitle")}
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
        initialValues={model ? toInput(model) : emptyInput()}
        className="px-5 py-4"
      >
        <Form.Item
          name="name"
          label={required(t("models.name"))}
          rules={[{ required: true, whitespace: true, message: t("models.required") }]}
        >
          <Input maxLength={150} />
        </Form.Item>

        <Form.Item
          name="brandId"
          label={required(t("models.brand"))}
          extra={hasProducts ? t("models.brandLocked") : undefined}
          rules={[{ required: true, message: t("models.required") }]}
        >
          <Select
            showSearch={{ filterOption: false, onSearch: setBrandSearch }}
            loading={brands.isFetching}
            disabled={hasProducts}
            options={brandOptions}
            placeholder={t("models.chooseBrand")}
            onChange={() => setBrandSearch("")}
          />
        </Form.Item>

        <Form.Item name="isActive" label={t("models.status")} className="mb-0">
          <Select
            options={[
              { value: true, label: t("models.active") },
              { value: false, label: t("models.draft") },
            ]}
          />
        </Form.Item>
      </Form>

      <div className="flex items-center justify-between gap-3 border-t border-slate-100 px-5 py-3">
        <div className="flex min-w-0 items-center gap-3">
          {model && (
            <Popconfirm
              title={t("models.deleteConfirm")}
              okText={t("common.delete")}
              okButtonProps={{ danger: true }}
              cancelText={t("common.cancel")}
              disabled={hasProducts}
              onConfirm={handleDelete}
            >
              <Button danger disabled={hasProducts} loading={remove.isPending}>
                {t("common.delete")}
              </Button>
            </Popconfirm>
          )}
          {hasProducts && model && (
            <span className="text-xs leading-tight text-slate-500">
              {t("models.usedHint", { count: model.productsCount })}
            </span>
          )}
        </div>
        <div className="flex shrink-0 gap-2">
          <Button onClick={() => guard.confirmClose(onClose)}>{t("common.cancel")}</Button>
          <Button type="primary" loading={saving} onClick={() => void handleSave()}>
            {t("models.save")}
          </Button>
        </div>
      </div>
    </Card>
  );
}
