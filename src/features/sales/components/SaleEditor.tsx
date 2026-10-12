import { Alert, App, DatePicker, Form, Input, Switch } from "antd";
import dayjs, { type Dayjs } from "dayjs";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ProductPicker } from "@/features/ad-blocks";
import { getErrorMessage } from "@/shared/api";
import { useEditorForm } from "@/shared/form";
import { EditorDrawer, ImageField } from "@/shared/ui";
import { useCreateSale, useDeleteSale, useSaleQuery, useUpdateSale } from "../hooks/queries";
import type { SaleFiles, SaleProduct } from "../model/types";

interface Props {
  /** "new" — create; a number — edit that sale */
  id: number | "new";
  onClose: () => void;
}

interface FormValues {
  name: string;
  period: [Dayjs, Dayjs];
  isMain: boolean;
  isVisible: boolean;
  products: SaleProduct[];
}

const API_DATE = "YYYY-MM-DD";

/** Aksiya: name, period, pictures, "main" and visibility switches, and the products. */
export function SaleEditor({ id, onClose }: Props) {
  const { t } = useTranslation();
  const { message } = App.useApp();
  const [form] = Form.useForm<FormValues>();
  // the API names: `discount_from` / `discount_to` are one "period" field in the form
  const guard = useEditorForm(form, { discount_from: "period", discount_to: "period" });
  const [files, setFilesState] = useState<SaleFiles>({});
  const setFile = (key: keyof SaleFiles) => (file: File) => {
    setFilesState((current) => ({ ...current, [key]: file }));
    guard.markDirty();
  };

  const editing = id !== "new";
  const detail = useSaleQuery(editing ? id : null);
  const create = useCreateSale();
  const update = useUpdateSale();
  const remove = useDeleteSale();
  const sale = detail.data;
  const saving = create.isPending || update.isPending;

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
    } catch {
      return;
    }
    const input = {
      name: values.name,
      discountFrom: values.period[0].format(API_DATE),
      discountTo: values.period[1].format(API_DATE),
      isMain: values.isMain,
      isVisible: values.isVisible,
      productIds: values.products.map((product) => product.id),
    };
    if (editing) update.mutate({ id, input, files }, done);
    else create.mutate({ input, files }, done);
  };

  const handleDelete = () => {
    if (!editing) return;
    remove.mutate(id, {
      onSuccess: () => {
        message.success(t("common.deleted"));
        guard.saved();
        onClose();
      },
      onError: guard.showError,
    });
  };

  return (
    <EditorDrawer
      title={sale ? sale.name : t("sales.newTitle")}
      onClose={() => guard.confirmClose(onClose)}
      onSave={() => void handleSave()}
      saving={saving}
      loading={editing && detail.isPending}
      onDelete={editing ? handleDelete : undefined}
      deleting={remove.isPending}
      deleteConfirm={t("sales.deleteConfirm")}
    >
      {detail.error ? (
        <Alert type="error" showIcon title={getErrorMessage(detail.error)} />
      ) : (
        <Form
          form={form}
          {...guard.formProps}
          disabled={saving}
          layout="vertical"
          requiredMark={false}
          initialValues={{
            name: sale?.name ?? "",
            period: sale ? [dayjs(sale.discountFrom), dayjs(sale.discountTo)] : undefined,
            isMain: sale?.isMain ?? false,
            isVisible: sale?.isVisible ?? true,
            products: sale?.products ?? [],
          }}
        >
          <Form.Item
            name="name"
            label={
              <>
                {t("sales.name")} <span className="text-red-600">*</span>
              </>
            }
            rules={[{ required: true, whitespace: true, message: t("sales.required") }]}
          >
            <Input maxLength={255} autoFocus />
          </Form.Item>

          <Form.Item
            name="period"
            label={
              <>
                {t("sales.period")} <span className="text-red-600">*</span>
              </>
            }
            rules={[{ required: true, message: t("sales.required") }]}
          >
            <DatePicker.RangePicker className="w-full" format="DD.MM.YYYY" />
          </Form.Item>

          <div className="mb-6 grid gap-4 sm:grid-cols-2">
            <div>
              <div className="mb-2 text-sm font-semibold">{t("sales.image")}</div>
              <ImageField
                url={sale?.image ?? null}
                file={files.image}
                onPick={setFile("image")}
                hint={t("sales.imageHint")}
              />
            </div>
            <div>
              <div className="mb-2 text-sm font-semibold">{t("sales.bgImage")}</div>
              <ImageField
                url={sale?.bgImage ?? null}
                file={files.bgImage}
                onPick={setFile("bgImage")}
                hint={t("sales.bgImageHint")}
              />
            </div>
          </div>

          <Form.Item name="products" label={t("sales.products")}>
            <ProductPicker />
          </Form.Item>

          <div className="space-y-4 border-t border-slate-100 pt-4">
            <label className="flex items-center justify-between gap-4">
              <span>
                <span className="block text-sm font-semibold">{t("sales.isMain")}</span>
                <span className="block text-xs text-slate-500">{t("sales.isMainHint")}</span>
              </span>
              <Form.Item name="isMain" valuePropName="checked" noStyle>
                <Switch />
              </Form.Item>
            </label>
            <label className="flex items-center justify-between gap-4">
              <span className="text-sm font-semibold">{t("sales.visibleSwitch")}</span>
              <Form.Item name="isVisible" valuePropName="checked" noStyle>
                <Switch />
              </Form.Item>
            </label>
          </div>
        </Form>
      )}
    </EditorDrawer>
  );
}
