import { PictureOutlined } from "@ant-design/icons";
import { Upload } from "antd";
import { useEffect, useMemo, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { clsx } from "@/shared/lib/clsx";

interface Props {
  label: ReactNode;
  /** the wide (desktop) area fills the row; the square (mobile) one has a fixed width */
  wide?: boolean;
  /** saved image */
  url: string | null;
  /** newly picked file, not saved yet */
  file: File | undefined;
  onPick: (file: File) => void;
}

/** A dashed area with the picture (or "Yuklash"); a click opens the file dialog. */
export function BannerImageDrop({ label, wide, url, file, onPick }: Props) {
  const { t } = useTranslation();
  const preview = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);

  useEffect(
    () => () => {
      if (preview) URL.revokeObjectURL(preview);
    },
    [preview],
  );

  const src = preview ?? url;

  return (
    <div className={wide ? "w-80 max-w-full min-w-0" : "shrink-0"}>
      <div className="mb-2 text-xs font-bold whitespace-nowrap text-slate-600">{label}</div>
      <Upload
        accept="image/jpeg,image/png,image/webp"
        showUploadList={false}
        beforeUpload={(picked) => {
          onPick(picked);
          return false; // sent with the form, not by <Upload>
        }}
        // antd wraps the trigger in inline elements — make them fill the area
        className="block w-full [&_.ant-upload]:block! [&_.ant-upload]:w-full!"
      >
        <button
          type="button"
          className={clsx(
            "relative grid h-[100px] cursor-pointer place-items-center overflow-hidden rounded-xl border border-dashed border-slate-300 p-0 text-center transition hover:border-brand",
            wide ? "w-full" : "w-[100px]",
            src ? "bg-slate-100" : "bg-surface-alt text-slate-500",
          )}
        >
          {src ? (
            <img src={src} alt="" className="absolute inset-0 size-full object-cover" />
          ) : (
            <span className="flex flex-col items-center gap-2 px-2">
              <PictureOutlined className="text-base" />
              <span className="font-mono text-[11px] leading-tight break-all">
                {t("banners.upload")}
              </span>
            </span>
          )}
          {src && (
            <span className="absolute inset-x-0 bottom-0 bg-slate-900/60 py-1 text-[11px] font-bold text-white">
              {t("common.changeImage")}
            </span>
          )}
        </button>
      </Upload>
    </div>
  );
}
