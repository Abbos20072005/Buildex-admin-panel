import { CloseIcon } from "@/shared/icons";
import { App, AutoComplete, Button, Card, Form, Input, Popconfirm, Switch } from "antd";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { getErrorMessage } from "@/shared/api";
import { ImageField } from "@/shared/ui";
import { useCreateBrand, useDeleteBrand, useUpdateBrand } from "../hooks/queries";
import { COUNTRY_SUGGESTIONS } from "../model/constants";
import type { Brand, BrandInput } from "../model/types";

interface Props {
  /** null — a new brand is being created */
  brand: Brand | null;
  onClose: () => void;
}

const emptyInput = (): BrandInput => ({
  name: "",
  descriptions: { uz: "", ru: "" },
  country: "",
  // a new brand starts hidden (saved as a draft)
  isVisible: false,
  code: "",
});

const toInput = (brand: Brand): BrandInput => ({
  name: brand.names.ru || brand.names.uz || brand.name,
  descriptions: { ...brand.descriptions },
  country: brand.country,
  isVisible: brand.isVisible,
  code: brand.code ?? "",
});

/**
 * Side panel: create / edit one brand. The form is remounted (`key`) for every brand,
 * so it always starts from the saved values.
 */
export function BrandEditor({ brand, onClose }: Props) {
  const { t } = useTranslation();
  const { message } = App.useApp();
  const [form] = Form.useForm<BrandInput>();
  const [image, setImage] = useState<File | undefined>();

  const create = useCreateBrand();
  const update = useUpdateBrand();
  const remove = useDeleteBrand();
  const saving = create.isPending || update.isPending;

  // a brand with products can't be deleted — it is hidden instead
  const hasProducts = (brand?.productsCount ?? 0) > 0;
  const isVisible = Form.useWatch("isVisible", form) ?? brand?.isVisible ?? false;

  const handleSave = async () => {
    try {
      await form.validateFields();
    } catch {
      return;
    }
    if (!brand && !image) {
      message.error(t("brands.logoRequired"));
      return;
    }
    const input = form.getFieldsValue(true) as BrandInput;
    const done = {
      onSuccess: () => {
        message.success(t("brands.saved"));
        onClose();
      },
      onError: (err: unknown) => message.error(getErrorMessage(err)),
    };
    if (brand) update.mutate({ brand, input, image }, done);
    else if (image) create.mutate({ input, image }, done);
  };

  const handleDelete = () => {
    if (!brand) return;
    remove.mutate(brand.id, {
      onSuccess: () => {
        message.success(t("brands.deleted"));
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
              {brand ? brand.name : t("brands.newTitle")}
            </div>
            <div className="mt-0.5 text-xs font-normal text-slate-500">
              {brand
                ? t("brands.subtitle", { count: brand.productsCount })
                : t("brands.newSubtitle")}
            </div>
          </div>
          <Button
            type="text"
            icon={<CloseIcon />}
            onClick={onClose}
            aria-label={t("common.cancel")}
          />
        </div>
      }
    >
      <Form
        form={form}
        layout="vertical"
        requiredMark={false}
        initialValues={brand ? toInput(brand) : emptyInput()}
        className="max-h-[calc(100vh-17rem)] overflow-y-auto px-5 py-4"
      >
        <Form.Item
          label={
            <>
              {t("brands.logo")} {!brand && <span className="text-red-600">*</span>}
            </>
          }
        >
          <ImageField
            url={brand?.image ?? null}
            file={image}
            onPick={setImage}
            hint={t("brands.logoHint")}
          />
        </Form.Item>

        <div className="grid grid-cols-2 gap-3">
          <Form.Item
            name="name"
            label={
              <>
                {t("brands.name")} <span className="text-red-600">*</span>
              </>
            }
            rules={[{ required: true, whitespace: true, message: t("brands.required") }]}
          >
            <Input maxLength={255} />
          </Form.Item>
          <Form.Item name="country" label={t("brands.country")}>
            <AutoComplete
              allowClear
              maxLength={100}
              placeholder="—"
              options={COUNTRY_SUGGESTIONS.map((country) => ({ value: country }))}
              filterOption={(input, option) =>
                (option?.value ?? "").toLowerCase().includes(input.toLowerCase())
              }
            />
          </Form.Item>
        </div>

        <Form.Item name={["descriptions", "uz"]} label={t("brands.descriptionUz")}>
          <Input.TextArea autoSize={{ minRows: 3, maxRows: 8 }} />
        </Form.Item>
        <Form.Item name={["descriptions", "ru"]} label={t("brands.descriptionRu")}>
          <Input.TextArea autoSize={{ minRows: 3, maxRows: 8 }} placeholder="Описание бренда" />
        </Form.Item>

        <Form.Item name="code" label={t("brands.code")}>
          <Input maxLength={50} className="max-w-60" />
        </Form.Item>

        <div className="mt-2 border-t border-slate-100 pt-4">
          <div className="mb-3 font-semibold">{t("brands.visibility")}</div>
          <label className="flex items-center justify-between gap-3">
            <span>{t("brands.showOnHome")}</span>
            <Form.Item name="isVisible" valuePropName="checked" noStyle>
              <Switch />
            </Form.Item>
          </label>
          {!isVisible && (
            <div className="mt-2 text-xs text-slate-500">{t("brands.hiddenHint")}</div>
          )}
        </div>
      </Form>

      <div className="flex items-center justify-between gap-3 border-t border-slate-100 px-5 py-3">
        <div className="flex min-w-0 items-center gap-3">
          {brand && (
            <Popconfirm
              title={t("brands.deleteConfirm")}
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
          {hasProducts && brand && (
            <span className="text-xs leading-tight text-slate-500">
              {t("brands.usedHint", { count: brand.productsCount })}
            </span>
          )}
        </div>
        <div className="flex shrink-0 gap-2">
          <Button onClick={onClose}>{t("common.cancel")}</Button>
          <Button type="primary" loading={saving} onClick={() => void handleSave()}>
            {t("brands.save")}
          </Button>
        </div>
      </div>
    </Card>
  );
}
