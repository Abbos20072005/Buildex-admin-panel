import { useMutation, useQueryClient } from "@tanstack/react-query";
import { runBulk, type BulkResult } from "./bulk";

/**
 * "Change the status of the selected rows": one request per key (the API has no bulk endpoint),
 * then the lists under `listKey` are reloaded — also when some of the requests failed.
 * `K` is the row key: the record id, or a string where ids repeat (category levels).
 */
export function useBulkMutation<V, K extends string | number = number>(
  run: (key: K, value: V) => Promise<unknown>,
  listKey: readonly unknown[],
) {
  const queryClient = useQueryClient();
  return useMutation<BulkResult, Error, { ids: K[]; value: V }>({
    mutationFn: ({ ids, value }) => runBulk(ids, (key) => run(key, value)),
    onSettled: () => void queryClient.invalidateQueries({ queryKey: listKey }),
  });
}
