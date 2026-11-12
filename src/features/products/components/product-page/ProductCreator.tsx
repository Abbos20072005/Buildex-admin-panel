import { SaveIcon, SendIcon } from "@/shared/icons";
import { App, Breadcrumb, Button, Form } from "antd";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { getErrorMessage } from "@/shared/api";
import { reportInvalid, useEditorForm } from "@/shared/form";
import { productsApi } from "../../api/products.api";
import { useCreateProduct, useUpdateProduct } from "../../hooks/queries";
import type { ProductPatch, PublishStatus } from "../../model/types";
import {
  emptyCreateValues,
  PRODUCT_ERROR_FIELDS,
  placeholderProduct,
  toCreateInput,
  type ProductCreateValues,
} from "./form";
import { PendingImagesCard, type PendingImage } from "./PendingImagesCard";
import { ProductCatalogCard } from "./ProductCatalogCard";
import { ProductCharacteristicsCard } from "./ProductCharacteristicsCard";
import { ProductContentCard } from "./ProductContentCard";
import { ProductLinksCard } from "./ProductLinksCard";
import { ProductPricingCard } from "./ProductPricingCard";
import { ProductPublishCard } from "./ProductPublishCard";
import { ProductSpecsCard } from "./ProductSpecsCard";

interface Props {
  /** back to the product list */
  onBack: () => void;
  /** the product is made: open it for editing */
  onCreated: (id: number) => void;
}

const plainText = (html: string | undefined) => (html ?? "").replace(/<[^>]*>/g, "").trim();

/**
 * A new product. The order of the requests is fixed by the API: the product first (a hidden
 * draft), then its photos one by one, then — only when wanted — activation and the publish
 * status. If a step after the first fails, the product already exists, so the page opens it for
 * editing instead of staying on the "create" form (a second save would make a copy).
 */
export function ProductCreator({ onBack, onCreated }: Props) {
  const { t } = useTranslation();
  const { message } = App.useApp();
  const [form] = Form.useForm<ProductCreateValues>();
  const guard = useEditorForm(form, PRODUCT_ERROR_FIELDS);
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();

  const [initialValues] = useState(emptyCreateValues);
  const [images, setImages] = useState<PendingImage[]>([]);
  const [saving, setSaving] = useState(false);

  const status = Form.useWatch<PublishStatus | undefined>("publishStatus", {
    form,
    preserve: true,
  });
  const placeholder = useMemo(
    () =>
      placeholderProduct(
        status ?? "draft",
        images.map((image, index) => ({ id: index, url: image.url })),
      ),
    [status, images],
  );

  const leave = () => guard.confirmClose(onBack);

  const handleSave = async (sendStatus?: PublishStatus) => {
    try {
      await form.validateFields();
    } catch (error) {
      reportInvalid(error, message);
      return;
    }

    const values = form.getFieldsValue(true) as ProductCreateValues;
    // Russian is the base language of the API: its name and description are required
    const missing: (["names", "ru"] | ["descriptions", "ru"])[] = [];
    if (!values.names?.ru?.trim()) missing.push(["names", "ru"]);
    if (!plainText(values.descriptions?.ru)) missing.push(["descriptions", "ru"]);
    if (missing.length) {
      form.setFields(missing.map((name) => ({ name, errors: [t("products.create.required")] })));
      form.scrollToField(missing[0], { block: "center" });
      message.error(t("products.create.needRussian"));
      return;
    }

    setSaving(true);
    let created;
    try {
      created = await createProduct.mutateAsync(toCreateInput(values));
    } catch (error) {
      guard.showError(error);
      setSaving(false);
      return;
    }

    // from here the product exists: nothing below may stop the page from opening it
    let failedImages = 0;
    for (const image of images) {
      try {
        // one after another: every photo goes to the end of the list, so this is their order
        await productsApi.uploadImage(created.id, image.file);
      } catch {
        failedImages++;
      }
    }

    const wanted = sendStatus ?? values.publishStatus;
    const patch: ProductPatch = {};
    // shown on the site only once its photos are in
    if (values.isActive && failedImages === 0) patch.isActive = true;
    if (wanted !== "draft") patch.publishStatus = wanted;

    let patchError: unknown = null;
    if (Object.keys(patch).length) {
      try {
        await updateProduct.mutateAsync({ id: created.id, patch });
      } catch (error) {
        patchError = error;
      }
    }

    guard.saved();
    if (failedImages) message.warning(t("products.create.imagesFailed", { count: failedImages }));
    if (patchError) {
      message.warning(`${t("products.create.statusFailed")} ${getErrorMessage(patchError)}`);
    } else if (!failedImages) {
      message.success(t("products.create.created"));
    }
    onCreated(created.id);
  };

  return (
    <>
      <Breadcrumb
        className="mb-4"
        items={[
          {
            title: (
              <a className="font-semibold text-brand" onClick={leave}>
                {t("products.title")}
              </a>
            ),
          },
          { title: t("products.create.title") },
        ]}
      />

      <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="m-0 text-xl leading-tight font-bold tracking-tight">
            {t("products.create.title")}
          </h1>
          <p className="m-0 mt-1 text-[13px] text-slate-500">{t("products.create.subtitle")}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button disabled={saving} onClick={leave}>
            {t("common.cancel")}
          </Button>
          <Button
            icon={<SaveIcon />}
            type={status === "draft" || !status ? "default" : "primary"}
            loading={saving}
            onClick={() => void handleSave()}
          >
            {t("products.modal.save")}
          </Button>
          {(status === "draft" || !status) && (
            <Button
              type="primary"
              icon={<SendIcon />}
              disabled={saving}
              onClick={() => void handleSave("review")}
            >
              {t("products.modal.sendToReview")}
            </Button>
          )}
        </div>
      </div>

      <Form
        form={form}
        {...guard.formProps}
        initialValues={initialValues}
        disabled={saving}
        layout="vertical"
        className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_380px]"
      >
        <div className="flex min-w-0 flex-col gap-4">
          <ProductContentCard />
          <PendingImagesCard
            items={images}
            onChange={(next) => {
              setImages(next);
              guard.markDirty();
            }}
          />
          <ProductPricingCard />
          <ProductSpecsCard />
          <ProductCharacteristicsCard />
          <ProductLinksCard product={placeholder} />
        </div>
        <div className="flex min-w-0 flex-col gap-4">
          <ProductPublishCard product={placeholder} />
          <ProductCatalogCard creating product={placeholder} />
        </div>
      </Form>
    </>
  );
}
