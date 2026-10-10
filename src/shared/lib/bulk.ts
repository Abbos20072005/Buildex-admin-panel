export interface BulkResult {
  succeeded: number;
  failed: number;
}

/** How many requests run at the same time (a long list must not flood the API). */
const PARALLEL = 5;

/**
 * Runs one request per key (a record id), a few at a time, and counts what went through: one
 * failed record (a blocked self, a record deleted meanwhile) doesn't stop the rest.
 */
export async function runBulk<K extends string | number = number>(
  keys: K[],
  run: (key: K) => Promise<unknown>,
): Promise<BulkResult> {
  const result: BulkResult = { succeeded: 0, failed: 0 };
  for (let start = 0; start < keys.length; start += PARALLEL) {
    const settled = await Promise.allSettled(keys.slice(start, start + PARALLEL).map(run));
    for (const item of settled) {
      if (item.status === "fulfilled") result.succeeded += 1;
      else result.failed += 1;
    }
  }
  return result;
}
