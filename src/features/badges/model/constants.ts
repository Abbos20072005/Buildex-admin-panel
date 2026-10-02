import { badgeColors } from "@/theme";
import type { RuleField, RuleOperator } from "./types";

export const RULE_FIELDS: RuleField[] = ["discount", "created_days", "quantity", "sales_30d"];

export const RULE_OPERATORS: { value: RuleOperator; symbol: string }[] = [
  { value: "gt", symbol: ">" },
  { value: "gte", symbol: "≥" },
  { value: "lt", symbol: "<" },
  { value: "lte", symbol: "≤" },
  { value: "eq", symbol: "=" },
];

export const OPERATOR_SYMBOL: Record<RuleOperator, string> = Object.fromEntries(
  RULE_OPERATORS.map(({ value, symbol }) => [value, symbol]),
) as Record<RuleOperator, string>;

/** the API default colour (the first of the palette) */
export const DEFAULT_COLOR: string = badgeColors[0];

export const PAGE_SIZES = ["20", "50", "100"];
export const DEFAULT_PAGE_SIZE = 100;
