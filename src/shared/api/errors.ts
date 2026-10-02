export class ApiError extends Error {
  readonly status: number;
  readonly body: unknown;

  constructor(status: number, message: string, body?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }

  /** fetch() itself failed — no connection, DNS, CORS… */
  get isNetwork() {
    return this.status === 0;
  }
}

/** Human-readable message from a DRF error body: {detail}, {field: [msg]}, {non_field_errors: [...]}. */
export function extractErrorMessage(body: unknown, fallback: string): string {
  if (!body) return fallback;
  if (typeof body === "string") return body.slice(0, 200);
  if (Array.isArray(body)) return typeof body[0] === "string" ? body[0] : fallback;
  if (typeof body === "object") {
    const record = body as Record<string, unknown>;
    if (typeof record.detail === "string") return record.detail;
    if (record.detail && typeof record.detail === "object")
      return extractErrorMessage(record.detail, fallback);
    if (typeof record.message === "string") return record.message;
    for (const value of Object.values(record)) {
      if (typeof value === "string" && value) return value;
      if (Array.isArray(value) && typeof value[0] === "string") return value[0];
    }
  }
  return fallback;
}

export function getErrorMessage(error: unknown, fallback = "Error"): string {
  return error instanceof Error && error.message ? error.message : fallback;
}
