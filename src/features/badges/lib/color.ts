import { brand } from "@/theme";

/** Text colour that stays readable on a badge of the given `#RRGGBB` background. */
export function badgeTextColor(hex: string): string {
  const value = hex.replace("#", "");
  if (value.length !== 6) return brand.white;
  const [r, g, b] = [0, 2, 4].map((start) => parseInt(value.slice(start, start + 2), 16));
  // perceived brightness (ITU-R BT.601): light backgrounds (yellow) get dark text
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 160 ? brand.text : brand.white;
}
