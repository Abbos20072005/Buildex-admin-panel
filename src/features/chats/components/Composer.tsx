import { CloseIcon, ImageIcon } from "@/shared/icons";
import { App, Button, Input } from "antd";
import { useRef, useState, type ClipboardEvent } from "react";
import { useTranslation } from "react-i18next";

/** Pictures are compressed on upload, but a huge original is still refused up front. */
const MAX_IMAGE_MB = 10;

interface Props {
  /** the answer is handed over at once: the thread shows it with a clock until it is saved */
  onSubmit: (text: string, image?: File) => void;
}

/** Reply box: text, an optional picture (also pasted), Enter sends (Shift+Enter — a new line). */
export function Composer({ onSubmit }: Props) {
  const { t } = useTranslation();
  const { message } = App.useApp();
  const [text, setText] = useState("");
  const [image, setImage] = useState<File>();
  const fileInput = useRef<HTMLInputElement>(null);

  const trimmed = text.trim();
  const canSend = trimmed.length > 0 || image !== undefined;

  const send = () => {
    if (!canSend) return;
    onSubmit(trimmed, image);
    setText("");
    setImage(undefined);
  };

  const pick = (file: File | undefined) => {
    if (!file) return;
    if (file.size > MAX_IMAGE_MB * 1024 * 1024) {
      message.error(t("common.imageTooBig", { size: MAX_IMAGE_MB }));
      return;
    }
    setImage(file);
  };

  // a screenshot pasted from the clipboard becomes the attached picture
  const paste = (event: ClipboardEvent) => {
    const file = [...event.clipboardData.files].find((item) => item.type.startsWith("image/"));
    if (!file) return;
    event.preventDefault();
    pick(file);
  };

  return (
    <div className="border-t border-slate-200 bg-white p-3">
      {image && (
        <div className="mb-2 inline-flex max-w-full items-center gap-2 rounded-lg bg-slate-100 px-2.5 py-1 text-xs">
          <ImageIcon />
          <span className="truncate">{image.name}</span>
          <Button
            type="text"
            size="small"
            icon={<CloseIcon />}
            aria-label={t("chats.composer.removeImage")}
            onClick={() => setImage(undefined)}
          />
        </div>
      )}
      <div className="flex items-end gap-2">
        <input
          ref={fileInput}
          type="file"
          accept="image/*"
          hidden
          onChange={(event) => {
            pick(event.target.files?.[0]);
            // the same file can be picked again after it was removed
            event.target.value = "";
          }}
        />
        <Button
          icon={<ImageIcon />}
          aria-label={t("chats.composer.attach")}
          onClick={() => fileInput.current?.click()}
        />
        <Input.TextArea
          autoSize={{ minRows: 1, maxRows: 6 }}
          maxLength={4000}
          placeholder={t("chats.composer.placeholder")}
          value={text}
          onChange={(event) => setText(event.target.value)}
          onPaste={paste}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
              event.preventDefault();
              send();
            }
          }}
        />
        <Button type="primary" disabled={!canSend} onClick={send}>
          {t("chats.composer.send")}
        </Button>
      </div>
      <div className="mt-1.5 text-[11px] text-slate-400">{t("chats.composer.hint")}</div>
    </div>
  );
}
