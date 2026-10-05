import { ImageIcon } from "@/shared/icons";
import { Button, Upload } from "antd";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

const MAX_SIZE_MB = 5;

interface Props {
  /** saved image */
  url: string | null;
  /** newly picked file, not saved yet */
  file: File | undefined;
  onPick: (file: File) => void;
  /** shown under the field */
  hint?: string;
}

/** Square preview + "choose file" button. The file is sent together with the form. */
export function ImageField({ url, file, onPick, hint }: Props) {
  const { t } = useTranslation();
  const [error, setError] = useState<string | null>(null);
  const preview = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);

  useEffect(
    () => () => {
      if (preview) URL.revokeObjectURL(preview);
    },
    [preview],
  );

  const src = preview ?? url;

  return (
    <div>
      <div className="flex items-center gap-4">
        <span className="grid size-16 shrink-0 place-items-center overflow-hidden rounded-xl border border-dashed border-slate-300 bg-slate-50 text-2xl text-slate-300">
          {src ? <img src={src} alt="" className="size-full object-contain" /> : <ImageIcon />}
        </span>
        <Upload
          accept="image/svg+xml,image/png,image/jpeg,image/webp"
          showUploadList={false}
          beforeUpload={(picked) => {
            if (picked.size > MAX_SIZE_MB * 1024 * 1024) {
              setError(t("common.imageTooBig", { size: MAX_SIZE_MB }));
            } else {
              setError(null);
              onPick(picked);
            }
            return false; // sent with the form, not by <Upload>
          }}
        >
          <Button>{src ? t("common.changeImage") : t("common.chooseImage")}</Button>
        </Upload>
      </div>
      {(error || hint) && (
        <div className={error ? "mt-1 text-xs text-red-600" : "mt-1 text-xs text-slate-500"}>
          {error ?? hint}
        </div>
      )}
    </div>
  );
}
