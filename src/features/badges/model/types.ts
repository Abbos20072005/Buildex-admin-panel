import type { LanguageCode } from "@/shared/i18n";

export type Localized = Record<LanguageCode, string>;

/** manual — set by hand on the product; auto — every product that matches the rule */
export type BadgeKind = "manual" | "auto";

/** What an automatic badge compares: discount %, days since added, stock, sales in 30 days */
export type RuleField = "discount" | "created_days" | "quantity" | "sales_30d";

/** gt `>` · gte `≥` · lt `<` · lte `≤` · eq `=` */
export type RuleOperator = "gt" | "gte" | "lt" | "lte" | "eq";

/** Teg / badge (GET /admin/product-badges/). */
export interface Badge {
  id: number;
  /** name in the admin UI language */
  name: string;
  names: Localized;
  kind: BadgeKind;
  ruleField: RuleField | null;
  ruleOperator: RuleOperator | null;
  ruleValue: number | null;
  /** `#RRGGBB` */
  color: string;
  position: number;
  isActive: boolean;
  productsCount: number;
}

/** What the editor sends (POST / PATCH /admin/product-badges/). */
export interface BadgeInput {
  names: Localized;
  kind: BadgeKind;
  ruleField: RuleField | null;
  ruleOperator: RuleOperator | null;
  ruleValue: number | null;
  color: string;
  isActive: boolean;
}

export interface BadgeListFilters {
  search?: string;
  kind?: BadgeKind;
  isActive?: boolean;
}
