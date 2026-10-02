import type { TFunction } from "i18next";
import { OPERATOR_SYMBOL } from "../model/constants";
import type { Badge } from "../model/types";

/**
 * The rule of an automatic badge in short form: "chegirma > 0", "yangi: 30 kun",
 * "qoldiq ≤ 3". Manual badges have no rule.
 */
export function formatRule(
  badge: Pick<Badge, "kind" | "ruleField" | "ruleOperator" | "ruleValue">,
  t: TFunction,
): string | null {
  const { kind, ruleField, ruleOperator, ruleValue } = badge;
  if (kind !== "auto" || !ruleField || !ruleOperator || ruleValue === null) return null;
  // "added less than N days ago" reads better as "new: N days"
  if (ruleField === "created_days" && ruleOperator === "lt") {
    return t("badges.ruleNew", { count: ruleValue });
  }
  return `${t(`badges.ruleShort.${ruleField}`)} ${OPERATOR_SYMBOL[ruleOperator]} ${ruleValue}`;
}
