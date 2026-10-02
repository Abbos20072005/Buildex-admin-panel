import { Alert, App, Breadcrumb, Card, Form, Skeleton } from "antd";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { getErrorMessage } from "@/shared/api";
import { useProductQuery, useUpdateProduct } from "../../hooks/queries";
import type { PublishStatus } from "../../model/types";
import { buildPatch, toFormValues, type ProductFormValues } from "./form";
import { ProductCatalogCard } from "./ProductCatalogCard";
import { ProductCharacteristicsCard } from "./ProductCharacteristicsCard";
import { ProductContentCard } from "./ProductContentCard";
import { ProductErpCard } from "./ProductErpCard";
import { ProductImagesCard } from "./ProductImagesCard";
import { ProductPageHeader } from "./ProductPageHeader";
import { ProductPublishCard } from "./ProductPublishCard";
import { ProductRatingCard } from "./ProductRatingCard";

interface Props {
  productId: number;
  /** back to the product list */
  onBack: () => void;
}

function LoadingState() {
  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_380px]">
      <Card>
        <Skeleton active paragraph={{ rows: 8 }} />
      </Card>
      <Card>
        <Skeleton active paragraph={{ rows: 6 }} />
      </Card>
    </div>
  );
}

/**
 * Product page: content, photos and characteristics on the left; publishing, 1C data,
 * catalog and rating on the right.
 */
export function ProductEditor({ productId, onBack }: Props) {
  const { t } = useTranslation();
  const { message, modal } = App.useApp();
  const [form] = Form.useForm<ProductFormValues>();

  const { data: product, error, isPending } = useProductQuery(productId);
  const updateProduct = useUpdateProduct();
  const [dirty, setDirty] = useState(false);

  // fill the form once per opened product — refetches (photos, language) must not wipe edits
  const loadedId = useRef<number | null>(null);
  const shown = product && product.id === productId ? product : undefined;
  useEffect(() => {
    if (!shown || loadedId.current === shown.id) return;
    loadedId.current = shown.id;
    form.setFieldsValue(toFormValues(shown));
    setDirty(false);
  }, [shown, form]);

  // closing the tab / reloading with unsaved edits
  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const leave = () => {
    if (!dirty) return onBack();
    modal.confirm({
      title: t("products.modal.unsavedTitle"),
      content: t("products.modal.unsavedText"),
      okText: t("products.modal.discard"),
      okButtonProps: { danger: true },
      cancelText: t("common.cancel"),
      onOk: onBack,
    });
  };

  const handleReset = () => {
    if (!shown) return;
    form.setFieldsValue(toFormValues(shown));
    setDirty(false);
  };

  const handleSave = async (publishStatus?: PublishStatus) => {
    if (!shown) return;
    try {
      await form.validateFields();
    } catch {
      return;
    }
    const values = form.getFieldsValue(true) as ProductFormValues;
    const patch = buildPatch(shown, publishStatus ? { ...values, publishStatus } : values);
    if (!Object.keys(patch).length) return setDirty(false);

    updateProduct.mutate(
      { id: shown.id, patch },
      {
        onSuccess: (saved) => {
          form.setFieldsValue(toFormValues(saved));
          setDirty(false);
          message.success(t("products.toast.saved"));
        },
        onError: (err) => message.error(getErrorMessage(err)),
      },
    );
  };

  const categoryParts = shown?.category?.path ? shown.category.path.split(" / ") : [];

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
          ...categoryParts.map((title) => ({ title })),
        ]}
      />

      {error ? (
        <Alert
          type="error"
          showIcon
          title={t("products.modal.loadError")}
          description={getErrorMessage(error)}
        />
      ) : isPending || !shown ? (
        <LoadingState />
      ) : (
        <>
          <div className="mb-4">
            <ProductPageHeader
              product={shown}
              dirty={dirty}
              saving={updateProduct.isPending}
              onSave={handleSave}
              onReset={handleReset}
            />
          </div>
          <Form
            form={form}
            layout="vertical"
            requiredMark={false}
            onValuesChange={() => setDirty(true)}
            className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_380px]"
          >
            <div className="flex min-w-0 flex-col gap-4">
              <ProductContentCard />
              <ProductImagesCard product={shown} />
              <ProductCharacteristicsCard />
            </div>
            <div className="flex min-w-0 flex-col gap-4">
              <ProductPublishCard product={shown} />
              <ProductErpCard product={shown} />
              <ProductCatalogCard product={shown} />
              <ProductRatingCard product={shown} />
            </div>
          </Form>
        </>
      )}
    </>
  );
}
