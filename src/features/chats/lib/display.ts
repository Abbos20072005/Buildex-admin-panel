import dayjs from "dayjs";
import type { TFunction } from "i18next";
import { maskPhone } from "@/shared/lib/format";
import type { Chat } from "../model/types";

/** The customer's name, or the phone, or "Guest" for a chat nobody is logged in to. */
export function chatTitle(chat: Pick<Chat, "customer">, t: TFunction): string {
  const customer = chat.customer;
  if (!customer) return t("chats.guest");
  return customer.fullName || maskPhone(customer.phone) || t("chats.guest");
}

/** "Bugun", "Kecha" or the date — the label of a day in the thread. */
export function dayLabel(iso: string, t: TFunction): string {
  const date = dayjs(iso);
  if (date.isSame(dayjs(), "day")) return t("chats.today");
  if (date.isSame(dayjs().subtract(1, "day"), "day")) return t("chats.yesterday");
  return date.format(date.isSame(dayjs(), "year") ? "DD.MM" : "DD.MM.YYYY");
}

/** Time for today, "DD.MM HH:mm" for earlier days, with the year for other years. */
export function chatTime(iso: string): string {
  const date = dayjs(iso);
  const now = dayjs();
  if (date.isSame(now, "day")) return date.format("HH:mm");
  return date.format(date.isSame(now, "year") ? "DD.MM HH:mm" : "DD.MM.YYYY HH:mm");
}
