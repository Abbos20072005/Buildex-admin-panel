import type { TableProps } from "antd";
import { useState } from "react";

/**
 * Selected rows of a table: `ids` for the bulk bar, `rowSelection` for the antd table.
 * The selection stays while pages are switched.
 */
export function useRowSelection<T extends { id: number }>() {
  const [ids, setIds] = useState<number[]>([]);
  const rowSelection: NonNullable<TableProps<T>["rowSelection"]> = {
    selectedRowKeys: ids,
    onChange: (keys) => setIds(keys as number[]),
    preserveSelectedRowKeys: true,
  };
  return { ids, clear: () => setIds([]), rowSelection };
}
