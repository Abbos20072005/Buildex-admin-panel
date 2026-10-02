import type { Query } from "@/shared/api";
import { DEFAULT_COLOR } from "../model/constants";
import type { Badge, BadgeInput, BadgeListFilters } from "../model/types";
import type { BadgeDto, BadgeWriteDto } from "./badges.dto";

const text = (value: string | null | undefined) => value ?? "";

export function mapBadge(dto: BadgeDto): Badge {
  return {
    id: dto.id,
    name: dto.name,
    names: { uz: text(dto.name_uz), ru: text(dto.name_ru) },
    kind: dto.kind,
    ruleField: dto.rule_field ?? null,
    ruleOperator: dto.rule_operator ?? null,
    ruleValue: dto.rule_value ?? null,
    color: dto.color || DEFAULT_COLOR,
    position: dto.position ?? 0,
    isActive: dto.is_active ?? true,
    productsCount: dto.products_count ?? 0,
  };
}

export function filtersToQuery(filters: BadgeListFilters): Query {
  return {
    search: filters.search?.trim() || undefined,
    kind: filters.kind,
    is_active: filters.isActive,
  };
}

/** The `rule_*` fields are required for automatic badges and ignored for manual ones. */
export function inputToDto(input: BadgeInput): BadgeWriteDto {
  const dto: BadgeWriteDto = {
    name_uz: input.names.uz.trim(),
    name_ru: input.names.ru.trim(),
    kind: input.kind,
    color: input.color,
    is_active: input.isActive,
  };
  if (input.kind === "auto" && input.ruleField && input.ruleOperator && input.ruleValue !== null) {
    dto.rule_field = input.ruleField;
    dto.rule_operator = input.ruleOperator;
    dto.rule_value = input.ruleValue;
  }
  return dto;
}
