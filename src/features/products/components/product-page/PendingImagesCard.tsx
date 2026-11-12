import { StarIcon, TrashIcon, UploadIcon } from "@/shared/icons";
import { App, Button, Card, Image, Tooltip, Upload } from "antd";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { clsx } from "@/shared/lib/clsx";

const MAX_SIZE_MB = 5;
const TYPES = ["image/jpeg", "image/png", "image/webp"];

/** A photo chosen for a product that is not saved yet: it is uploaded after the product is made. */
export interface PendingImage {
  uid: string;
  file: File;
  /** object URL for the preview */
  url: string;
}

interface Props {
  items: PendingImage[];
  onChange: (items: PendingImage[]) => void;
}

/**
 * Photos of a new product. A photo needs the product's id, so nothing is sent here: the files wait
 * in this list, in the order they will be uploaded (the first one becomes the main photo).
 */
export function PendingImagesCard({ items, onChange }: Props) {
  const { t } = useTranslation();
  const { message } = App.useApp();
  const [dragging, setDragging] = useState<string | null>(null);
  const [over, setOver] = useState<string | null>(null);

  // the previews are object URLs: let them go when the page is left
  const latest = useRef(items);
  useEffect(() => {
    latest.current = items;
  }, [items]);
  useEffect(() => () => latest.current.forEach((item) => URL.revokeObjectURL(item.url)), []);

  const add = (file: File) => {
    if (!TYPES.includes(file.type)) {
      message.error(t("products.create.imageType"));
      return;
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      message.error(t("products.modal.imageTooBig", { size: MAX_SIZE_MB }));
      return;
    }
    // several files can arrive in one tick: build on the list kept in the ref, not on the render
    const next = [
      ...latest.current,
      {
        uid: `${file.name}-${file.size}-${performance.now()}`,
        file,
        url: URL.createObjectURL(file),
      },
    ];
    latest.current = next;
    onChange(next);
  };

  const remove = (uid: string) => {
    const gone = items.find((item) => item.uid === uid);
    if (gone) URL.revokeObjectURL(gone.url);
    onChange(items.filter((item) => item.uid !== uid));
  };

  const makeMain = (uid: string) => {
    const picked = items.find((item) => item.uid === uid);
    if (picked) onChange([picked, ...items.filter((item) => item.uid !== uid)]);
  };

  const drop = (targetUid: string) => {
    if (dragging === null || dragging === targetUid) return;
    const next = [...items];
    const from = next.findIndex((item) => item.uid === dragging);
    const [moved] = next.splice(from, 1);
    next.splice(
      next.findIndex((item) => item.uid === targetUid),
      0,
      moved,
    );
    onChange(next);
  };

  return (
    <Card
      title={
        <>
          {t("products.modal.images")}{" "}
          <span className="font-normal text-slate-400">· {items.length}</span>
        </>
      }
    >
      <Image.PreviewGroup>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
          {items.map((item, index) => (
            <div
              key={item.uid}
              draggable={items.length > 1}
              onDragStart={(event) => {
                event.dataTransfer.effectAllowed = "move";
                setDragging(item.uid);
              }}
              onDragOver={(event) => {
                if (dragging === null) return;
                event.preventDefault();
                setOver(item.uid);
              }}
              onDrop={(event) => {
                event.preventDefault();
                drop(item.uid);
                setDragging(null);
                setOver(null);
              }}
              onDragEnd={() => {
                setDragging(null);
                setOver(null);
              }}
              className={clsx(
                "relative aspect-square overflow-hidden rounded-xl border bg-slate-50",
                items.length > 1 && "cursor-grab",
                over === item.uid && dragging !== item.uid
                  ? "border-brand ring-2 ring-brand/30"
                  : "border-slate-200",
                dragging === item.uid && "opacity-40",
              )}
            >
              <Image
                src={item.url}
                alt={item.file.name}
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
                    onClick={() => makeMain(item.uid)}
                  />
                </Tooltip>
              )}
              <Button
                size="small"
                danger
                icon={<TrashIcon />}
                className="absolute! right-2 bottom-2"
                aria-label={t("products.create.removeImage")}
                onClick={() => remove(item.uid)}
              />
            </div>
          ))}

          <Upload
            accept={TYPES.join(",")}
            showUploadList={false}
            multiple
            beforeUpload={(file) => {
              add(file);
              return false; // nothing is sent now
            }}
          >
            <button
              type="button"
              className="grid aspect-square w-full cursor-pointer place-items-center rounded-xl border border-dashed border-slate-300 bg-white text-center text-slate-500 transition hover:border-brand hover:text-brand"
            >
              <span className="px-2">
                <UploadIcon className="text-xl" />
                <span className="mt-2 block text-sm font-semibold">
                  {t("products.modal.upload")}
                </span>
              </span>
            </button>
          </Upload>
        </div>
      </Image.PreviewGroup>

      <p className="m-0 mt-3 text-xs text-slate-500">
        {t("products.create.imagesHint", { size: MAX_SIZE_MB })}
      </p>
    </Card>
  );
}
