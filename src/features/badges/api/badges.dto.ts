/** Raw shape of GET/POST/PATCH /admin/product-badges/ — only the mappers touch this. */

import type { BadgeKind, RuleField, RuleOperator } from "../model/types";

export interface BadgeDto {
  id: number;
  name: string;
  name_uz?: string | null;
  name_ru?: string | null;
  name_en?: string | null;
  kind: BadgeKind;
  rule_field?: RuleField | null;
  rule_operator?: RuleOperator | null;
  rule_value?: number | null;
  color?: string | null;
  position?: number;
  is_active?: boolean;
  products_count?: number;
}

export interface BadgeWriteDto {
  name_uz: string;
  name_ru: string;
  kind: BadgeKind;
  rule_field?: RuleField;
  rule_operator?: RuleOperator;
  rule_value?: number;
  color: string;
  is_active: boolean;
}
