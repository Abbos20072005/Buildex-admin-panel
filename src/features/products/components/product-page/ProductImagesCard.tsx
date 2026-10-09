import { StarIcon, TrashIcon, UploadIcon } from "@/shared/icons";
import { App, Button, Card, Image, Popconfirm, Tooltip, Upload } from "antd";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { getErrorMessage } from "@/shared/api";
import { clsx } from "@/shared/lib/clsx";
import {
  useDeleteProductImage,
  useReorderProductImages,
  useUploadProductImage,
} from "../../hooks/queries";
import type { ProductDetail } from "../../model/types";

const MAX_SIZE_MB = 5;

/**
 * Photos: uploaded / deleted / reordered right away (separate endpoints, not part of "Save").
 * The first photo is the main one: drag a photo to move it, or press the star to make it main.
 */
export function ProductImagesCard({ product }: { product: ProductDetail }) {
  const { t } = useTranslation();
  const { message } = App.useApp();
  const upload = useUploadProductImage();
  const remove = useDeleteProductImage();
  const reorder = useReorderProductImages();
  const [dragging, setDragging] = useState<number | null>(null);
  const [over, setOver] = useState<number | null>(null);

  const ids = product.images.map((image) => image.id);

  const saveOrder = (next: number[]) =>
    reorder.mutate(
      { id: product.id, ids: next },
      { onError: (error) => message.error(getErrorMessage(error)) },
    );

  const makeMain = (imageId: number) => saveOrder([imageId, ...ids.filter((id) => id !== imageId)]);

  const drop = (targetId: number) => {
    if (dragging === null || dragging === targetId) return;
    const next = [...ids];
    next.splice(next.indexOf(targetId), 0, ...next.splice(next.indexOf(dragging), 1));
    saveOrder(next);
  };

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
              draggable={product.images.length > 1}
              onDragStart={(event) => {
                event.dataTransfer.effectAllowed = "move";
                setDragging(image.id);
              }}
              onDragOver={(event) => {
                if (dragging === null) return;
                event.preventDefault();
                setOver(image.id);
              }}
              onDrop={(event) => {
                event.preventDefault();
                drop(image.id);
                setDragging(null);
                setOver(null);
              }}
              onDragEnd={() => {
                setDragging(null);
                setOver(null);
              }}
              className={clsx(
                "relative aspect-square overflow-hidden rounded-xl border bg-slate-50",
                product.images.length > 1 && "cursor-grab",
                over === image.id && dragging !== image.id
                  ? "border-brand ring-2 ring-brand/30"
                  : "border-slate-200",
                dragging === image.id && "opacity-40",
              )}
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
              {index > 0 && (
                <Tooltip title={t("products.modal.makeMain")}>
                  <Button
                    size="small"
                    icon={<StarIcon />}
                    className="absolute! bottom-2 left-2"
                    aria-label={t("products.modal.makeMain")}
                    onClick={() => makeMain(image.id)}
                  />
                </Tooltip>
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
