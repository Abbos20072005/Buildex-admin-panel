import { Alert, App, Form, Switch } from "antd";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { getErrorMessage } from "@/shared/api";
import { useEditorForm } from "@/shared/form";
import { emptyLocalized, failedLang, type ContentLang } from "@/shared/lib/localized";
import { EditorDrawer, LangTabs, LocalizedField } from "@/shared/ui";
import {
  useAdBlockQuery,
  useCreateAdBlock,
  useDeleteAdBlock,
  useUpdateAdBlock,
} from "../hooks/queries";
import type { AdBlockInput, AdBlockProduct } from "../model/types";
import { BrandSelect } from "./BrandSelect";
import { ProductPicker } from "./ProductPicker";

interface Props {
  /** "new" — create; a number — edit that block */
  id: number | "new";
  onClose: () => void;
}

type FormValues = Pick<AdBlockInput, "name" | "title" | "description" | "isVisible"> & {
  brandId: number | null;
  products: AdBlockProduct[];
};

/** Ad block: translated name, campaign page (title + text), optional brand, products, visibility. */
export function AdBlockEditor({ id, onClose }: Props) {
  const { t } = useTranslation();
  const { message } = App.useApp();
  const [form] = Form.useForm<FormValues>();
  const guard = useEditorForm(form);
  const [lang, setLang] = useState<ContentLang>("uz");

  const editing = id !== "new";
  const detail = useAdBlockQuery(editing ? id : null);
  const create = useCreateAdBlock();
  const update = useUpdateAdBlock();
  const remove = useDeleteAdBlock();
  const item = detail.data;

  const done = {
    onSuccess: () => {
      message.success(t("common.saved"));
      guard.saved();
      onClose();
    },
    onError: guard.showError,
  };

  const handleSave = async () => {
    let values: FormValues;
    try {
      values = await form.validateFields();
    } catch (error) {
      const failed = failedLang(error);
      if (failed) setLang(failed);
      return;
    }
    const { products, ...rest } = values;
    const input: AdBlockInput = { ...rest, productIds: products.map((product) => product.id) };
    if (editing) update.mutate({ id, input }, done);
    else create.mutate(input, done);
  };

  const handleDelete = () => {
    if (!editing) return;
    remove.mutate(id, {
      onSuccess: () => {
        message.success(t("common.deleted"));
        guard.saved();
        onClose();
      },
      onError: (error) => message.error(getErrorMessage(error)),
    });
  };

  return (
    <EditorDrawer
      title={item ? item.name : t("adBlocks.newTitle")}
      onClose={() => guard.confirmClose(onClose)}
      onSave={() => void handleSave()}
      saving={create.isPending || update.isPending}
      loading={editing && detail.isPending}
      onDelete={editing ? handleDelete : undefined}
      deleting={remove.isPending}
      deleteConfirm={t("adBlocks.deleteConfirm")}
    >
      {detail.error ? (
        <Alert type="error" showIcon title={getErrorMessage(detail.error)} />
      ) : (
        <Form
          form={form}
          {...guard.formProps}
          disabled={create.isPending || update.isPending}
          layout="vertical"
          requiredMark={false}
          initialValues={{
            name: item?.nameL ?? emptyLocalized(),
            title: item?.titleL ?? emptyLocalized(),
            description: item?.description ?? emptyLocalized(),
            brandId: item?.brand?.id ?? null,
            products: item?.products ?? [],
            isVisible: item?.isVisible ?? true,
          }}
        >
          <LangTabs value={lang} onChange={setLang} />
          <LocalizedField
            name="name"
            label={t("adBlocks.fields.name")}
            lang={lang}
            maxLength={450}
            requiredMessage={t("adBlocks.ruRequired")}
          />
          <LocalizedField
            name="title"
            label={t("adBlocks.fields.title")}
            lang={lang}
            maxLength={350}
            requiredMessage={t("adBlocks.ruRequired")}
          />
          <LocalizedField
            name="description"
            label={t("adBlocks.fields.description")}
            lang={lang}
            kind="rich"
            requiredMessage={t("adBlocks.ruRequired")}
          />

          <Form.Item name="brandId" label={t("adBlocks.fields.brand")}>
            <BrandSelect current={item?.brand ?? null} />
          </Form.Item>

          <Form.Item
            name="products"
            label={
              <>
                {t("adBlocks.fields.products")} <span className="text-red-600">*</span>
              </>
            }
            rules={[
              {
                validator: (_, value: AdBlockProduct[]) =>
                  value.length
                    ? Promise.resolve()
                    : Promise.reject(new Error(t("adBlocks.productsRequired"))),
              },
            ]}
          >
            <ProductPicker />
          </Form.Item>

          <Form.Item
            name="isVisible"
            label={t("adBlocks.fields.visible")}
            valuePropName="checked"
            extra={t("adBlocks.visibleHint")}
            className="mb-0"
          >
            <Switch />
          </Form.Item>
        </Form>
      )}
    </EditorDrawer>
  );
}
