import dayjs from "dayjs";

const NBSP = " ";

/** 1234567 → "1 234 567" (non-breaking spaces) */
export function formatNumber(value: number): string {
  return Math.round(value)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, NBSP);
}

export function formatMoney(value: number, currency = "UZS"): string {
  return `${formatNumber(value)}${NBSP}${currency}`;
}

export function formatOrderId(id: number): string {
  return `#${formatNumber(id)}`;
}

export function formatDate(iso: string | null | undefined): string {
  return iso ? dayjs(iso).format("DD.MM.YYYY") : "—";
}

export function formatTime(iso: string | null | undefined): string {
  return iso ? dayjs(iso).format("HH:mm") : "";
}

export function formatDateTime(iso: string | null | undefined): string {
  return iso ? dayjs(iso).format("DD.MM.YYYY HH:mm") : "—";
}

const onlyDigits = (value: string) => value.replace(/\D/g, "");

/** "+998901234567" → "+998 90 123 45 67" */
export function formatPhone(raw: string | null | undefined): string {
  const digits = onlyDigits(raw ?? "");
  if (digits.length !== 12) return raw ?? "";
  return `+${digits.slice(0, 3)} ${digits.slice(3, 5)} ${digits.slice(5, 8)} ${digits.slice(8, 10)} ${digits.slice(10)}`;
}

/** "+998901234567" → "+998 90 *** ** 67" */
export function maskPhone(raw: string | null | undefined): string {
  const digits = onlyDigits(raw ?? "");
  if (digits.length !== 12) return raw ?? "";
  return `+${digits.slice(0, 3)} ${digits.slice(3, 5)} *** ** ${digits.slice(10)}`;
}

export function telHref(raw: string): string {
  return `tel:+${onlyDigits(raw)}`;
}
