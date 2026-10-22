import { Button } from "antd";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { clsx } from "@/shared/lib/clsx";
import { MessageStatus } from "./MessageStatus";

/** An answer that is still being sent (clock), or that could not be sent (retry / remove). */
export interface PendingReply {
  key: number;
  text: string;
  image?: File;
  failed: boolean;
}

interface Props {
  reply: PendingReply;
  grouped: boolean;
  onRetry: () => void;
  onRemove: () => void;
}

export function PendingBubble({ reply, grouped, onRetry, onRemove }: Props) {
  const { t } = useTranslation();
  // a local preview of the picture that is on its way
  const [preview] = useState(() => (reply.image ? URL.createObjectURL(reply.image) : undefined));
  useEffect(() => () => (preview ? URL.revokeObjectURL(preview) : undefined), [preview]);

  return (
    <div className={clsx("flex flex-col items-end", grouped ? "mt-0.5" : "mt-3")}>
      <div
        className={clsx(
          "max-w-[78%] min-w-0 rounded-2xl rounded-br-md px-3 py-1.5 text-sm break-words whitespace-pre-wrap text-white",
          reply.failed ? "bg-red-500" : "bg-brand opacity-80",
        )}
      >
        {preview && <img src={preview} alt="" className="mb-1 w-60 rounded-lg object-cover" />}
        {reply.text}
        <span className="relative top-1 float-right ml-3 inline-flex translate-y-0.5 items-center text-[11px] leading-5 text-white/80">
          <MessageStatus state={reply.failed ? "failed" : "sending"} />
        </span>
      </div>
      {reply.failed && (
        <div className="mt-1 flex items-center gap-2 text-xs text-red-600">
          {t("chats.status.failed")}
          <Button size="small" type="link" onClick={onRetry}>
            {t("chats.retry")}
          </Button>
          <Button size="small" type="link" danger onClick={onRemove}>
            {t("common.delete")}
          </Button>
        </div>
      )}
    </div>
  );
}
