import { TrashIcon, UploadIcon } from "@/shared/icons";
import { App, Button, Card, Image, Popconfirm, Upload } from "antd";
import { useTranslation } from "react-i18next";
import { getErrorMessage } from "@/shared/api";
import { useDeleteProductImage, useUploadProductImage } from "../../hooks/queries";
import type { ProductDetail } from "../../model/types";

const MAX_SIZE_MB = 5;

/** Photos: uploaded / deleted right away (separate endpoints, not part of "Save"). */
export function ProductImagesCard({ product }: { product: ProductDetail }) {
  const { t } = useTranslation();
  const { message } = App.useApp();
  const upload = useUploadProductImage();
  const remove = useDeleteProductImage();

  const handleUpload = (file: File) => {
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      message.error(t("products.modal.imageTooBig", { size: MAX_SIZE_MB }));
      return;
    }
    upload.mutate(
      { id: product.id, file },
      {
        onSuccess: () => message.success(t("products.modal.imageUploaded")),
        onError: (error) => message.error(getErrorMessage(error)),
      },
    );
  };

  return (
    <Card
      title={
        <>
          {t("products.modal.images")}{" "}
          <span className="font-normal text-slate-400">· {product.images.length}</span>
        </>
      }
    >
      <Image.PreviewGroup>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
          {product.images.map((image, index) => (
            <div
              key={image.id}
              className="relative aspect-square overflow-hidden rounded-xl border border-slate-200 bg-slate-50"
            >
              <Image
                src={image.url}
                alt={product.name}
                width="100%"
                height="100%"
                className="object-contain!"
                rootClassName="size-full"
              />
              {index === 0 && (
                <span className="absolute top-2 left-2 rounded-md bg-brand px-1.5 text-[11px] leading-5 font-bold text-white uppercase">
                  {t("products.modal.mainImage")}
                </span>
              )}
              <Popconfirm
                title={t("products.modal.deleteImage")}
                okText={t("common.confirm")}
                cancelText={t("common.cancel")}
                okButtonProps={{ danger: true }}
                onConfirm={() =>
                  remove.mutateAsync({ id: product.id, imageId: image.id }).catch((error) => {
                    message.error(getErrorMessage(error));
                  })
                }
              >
                <Button
                  size="small"
                  danger
                  icon={<TrashIcon />}
                  className="absolute! right-2 bottom-2"
                  aria-label={t("products.modal.deleteImage")}
                />
              </Popconfirm>
            </div>
          ))}

          <Upload
            accept="image/jpeg,image/png,image/webp"
            showUploadList={false}
            multiple
            beforeUpload={(file) => {
              handleUpload(file);
              return false; // the request is sent by the mutation, not by <Upload>
            }}
          >
            <button
              type="button"
              disabled={upload.isPending}
              className="grid aspect-square w-full cursor-pointer place-items-center rounded-xl border border-dashed border-slate-300 bg-white text-center text-slate-500 transition hover:border-brand hover:text-brand disabled:cursor-wait disabled:opacity-60"
            >
              <span className="px-2">
                <UploadIcon className="text-xl" />
                <span className="mt-2 block text-sm font-semibold">
                  {upload.isPending ? t("products.modal.uploading") : t("products.modal.upload")}
                </span>
              </span>
            </button>
          </Upload>
        </div>
      </Image.PreviewGroup>

      <p className="m-0 mt-3 text-xs text-slate-500">
        {t("products.modal.imagesHint", { size: MAX_SIZE_MB })}
      </p>
    </Card>
  );
}
