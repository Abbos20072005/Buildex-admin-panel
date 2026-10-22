import { ClockIcon, ExclamationIcon } from "@/shared/icons";
import { useTranslation } from "react-i18next";

export type DeliveryState = "sending" | "sent" | "failed";

/** One tick: the answer is saved on the server (the API tells nothing about the customer reading it). */
export function Tick({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      width="14"
      height="14"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M3 8.5l3.2 3.2L13 5" />
    </svg>
  );
}

/** Clock while an answer is being sent, one tick when it is saved, a red mark when it failed. */
export function MessageStatus({ state }: { state: DeliveryState }) {
  const { t } = useTranslation();
  const label = t(`chats.status.${state}`);
  return (
    <span title={label} aria-label={label} className="inline-flex items-center">
      {state === "sending" ? (
        <ClockIcon className="text-[12px]" />
      ) : state === "failed" ? (
        <ExclamationIcon className="text-[12px] text-red-300" />
      ) : (
        <Tick />
      )}
    </span>
  );
}
