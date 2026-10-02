type ClassValue = string | false | null | undefined;

/** Joins truthy class names: clsx("a", cond && "b") */
export function clsx(...values: ClassValue[]): string {
  return values.filter(Boolean).join(" ");
}
