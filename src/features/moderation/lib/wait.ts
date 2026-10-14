import type { TFunction } from "i18next";
import { ApiError, getErrorMessage } from "@/shared/api";

const MINUTE = 60;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

/** One number with its unit — for the counter cards ("14 soat"). */
export function waitParts(seconds: number): { value: number; unit: "days" | "hours" | "minutes" } {
  if (seconds >= DAY) return { value: Math.round(seconds / DAY), unit: "days" };
  if (seconds >= HOUR) return { value: Math.round(seconds / HOUR), unit: "hours" };
  return { value: Math.max(1, Math.round(seconds / MINUTE)), unit: "minutes" };
}

/** "3 kun", "1 kun 4 soat", "18 soat", "45 daqiqa" */
export function formatWait(seconds: number, t: TFunction): string {
  const days = Math.floor(seconds / DAY);
  const hours = Math.floor((seconds % DAY) / HOUR);
  if (days > 0) {
    const day = t("moderation.duration.days", { count: days });
    return hours > 0 && days < 3
      ? `${day} ${t("moderation.duration.hours", { count: hours })}`
      : day;
  }
  if (hours > 0) return t("moderation.duration.hours", { count: hours });
  return t("moderation.duration.minutes", { count: Math.max(1, Math.floor(seconds / MINUTE)) });
}

/** The API's own messages are English; the two expected ones are shown in the UI language. */
export function moderationError(error: unknown, t: TFunction): string {
  if (error instanceof ApiError) {
    const body = error.body as { detail?: unknown; missing?: unknown } | null;
    if (Array.isArray(body?.missing)) return t("moderation.toast.notReady");
    if (typeof body?.detail === "string" && /already reviewed/i.test(body.detail))
      return t("moderation.toast.alreadyReviewed");
  }
  return getErrorMessage(error);
}
