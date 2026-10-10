import { CloseIcon } from "@/shared/icons";
import { App, Button, Select } from "antd";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { UseMutationResult } from "@tanstack/react-query";
import type { BulkResult } from "@/shared/lib/bulk";

export interface BulkOption<V> {
  value: V;
  label: string;
}

interface Props<V extends string | number | boolean, K extends string | number> {
  /** keys of the selected rows (record ids) */
  ids: K[];
  options: BulkOption<V>[];
  mutation: UseMutationResult<BulkResult, Error, { ids: K[]; value: V }>;
  onClear: () => void;
  /** placeholder of the select; default "Holatni o'zgartirish" */
  placeholder?: string;
}

/**
 * The bar above a table with selected rows: "20 ta tanlandi" + a status select that applies
 * to all of them at once. Shows how many went through and how many failed.
 */
export function BulkBar<V extends string | number | boolean, K extends string | number>({
  ids,
  options,
  mutation,
  onClear,
  placeholder,
}: Props<V, K>) {
  const { t } = useTranslation();
  const { message } = App.useApp();
  // the select works with the option's position, so a value may also be a boolean
  const [pending, setPending] = useState<number | null>(null);

  if (ids.length === 0) return null;

  const apply = (index: number) => {
    const { value } = options[index];
    setPending(index);
    mutation.mutate(
      { ids, value },
      {
        onSuccess: ({ succeeded, failed }) => {
          if (succeeded) message.success(t("bulk.updated", { count: succeeded }));
          if (failed) message.error(t("bulk.failed", { count: failed }));
          if (!failed) onClear();
        },
        onError: (error) => message.error(error.message),
        onSettled: () => setPending(null),
      },
    );
  };

  return (
    <div className="mb-3 flex flex-wrap items-center gap-3 rounded-xl bg-navy px-4 py-2.5 text-white shadow-sm">
      <strong className="mr-1">{t("common.selected", { count: ids.length })}</strong>
      <Select<number>
        className="min-w-56"
        placeholder={placeholder ?? t("bulk.changeStatus")}
        value={pending ?? undefined}
        loading={mutation.isPending}
        disabled={mutation.isPending}
        options={options.map((option, index) => ({ value: index, label: option.label }))}
        onChange={apply}
      />
      <Button
        type="text"
        icon={<CloseIcon />}
        onClick={onClear}
        className="ml-auto text-slate-300! hover:text-white!"
      >
        {t("bulk.clear")}
      </Button>
    </div>
  );
}
