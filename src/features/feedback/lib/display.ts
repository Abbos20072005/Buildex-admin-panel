import dayjs from "dayjs";
import type { TFunction } from "i18next";
import { formatPhone } from "@/shared/lib/format";
import type { FeedbackCustomer } from "../model/types";

/** The customer's name, or the phone, or "Guest" when the author is unknown. */
export function authorTitle(customer: FeedbackCustomer | null, t: TFunction): string {
  if (!customer) return t("feedback.guest");
  return customer.fullName || formatPhone(customer.phone) || t("feedback.guest");
}

/** Today — the time, this year — the day and month, earlier — with the year. */
export function shortTime(iso: string): string {
  const date = dayjs(iso);
  if (date.isSame(dayjs(), "day")) return date.format("HH:mm");
  return date.format(date.isSame(dayjs(), "year") ? "DD.MM" : "DD.MM.YYYY");
}
