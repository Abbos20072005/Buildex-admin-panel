export interface TokenPair {
  access?: string;
  refresh?: string;
}

/**
 * The login / refresh responses are not described in the schema, so accept the
 * common shapes: {access, refresh} (simplejwt), {access_token, refresh_token},
 * optionally wrapped in {result | tokens | data}.
 */
export function extractTokens(data: unknown): TokenPair {
  if (!data || typeof data !== "object") return {};
  const record = data as Record<string, unknown>;

  if (typeof record.access_token === "string") {
    return { access: record.access_token, refresh: record.refresh_token as string | undefined };
  }
  if (typeof record.access === "string") {
    return { access: record.access, refresh: record.refresh as string | undefined };
  }

  const nested = record.result ?? record.tokens ?? record.data;
  return nested && typeof nested === "object" ? extractTokens(nested) : {};
}
