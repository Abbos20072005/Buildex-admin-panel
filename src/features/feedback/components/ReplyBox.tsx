import { Button, Input } from "antd";
import { useState } from "react";
import { useTranslation } from "react-i18next";

interface Props {
  loading: boolean;
  /** resolves when the answer is saved: only then the box is emptied */
  onSubmit: (text: string) => Promise<unknown>;
}

/** The shop's answer: Enter sends, Shift+Enter is a new line. */
export function ReplyBox({ loading, onSubmit }: Props) {
  const { t } = useTranslation();
  const [text, setText] = useState("");
  const trimmed = text.trim();

  const send = () => {
    if (!trimmed || loading) return;
    onSubmit(trimmed).then(
      () => setText(""),
      // the error is shown by the caller; the typed answer stays
      () => undefined,
    );
  };

  return (
    <div className="border-t border-slate-200 bg-white p-3">
      <div className="flex items-end gap-2">
        <Input.TextArea
          autoFocus
          autoSize={{ minRows: 2, maxRows: 8 }}
          maxLength={2000}
          placeholder={t("feedback.composer.placeholder")}
          value={text}
          onChange={(event) => setText(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
              event.preventDefault();
              send();
            }
          }}
        />
        <Button type="primary" disabled={!trimmed} loading={loading} onClick={send}>
          {t("feedback.composer.send")}
        </Button>
      </div>
      <div className="mt-1.5 text-[11px] text-slate-400">{t("feedback.composer.hint")}</div>
    </div>
  );
}
