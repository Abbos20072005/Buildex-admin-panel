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

/** Only the time: the thread shows the day on its own label above the messages. */
export function chatTime(iso: string): string {
  return dayjs(iso).format("HH:mm");
}
