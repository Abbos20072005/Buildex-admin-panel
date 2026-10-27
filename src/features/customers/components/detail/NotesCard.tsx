import { App, Button, Input, Skeleton } from "antd";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { getErrorMessage } from "@/shared/api";
import { formatDateTime } from "@/shared/lib/format";
import { useAddCustomerNote, useCustomerNotesQuery } from "../../hooks/queries";
import { CUSTOMER_API } from "../../model/capabilities";
import { CardEmpty, SectionCard } from "./SectionCard";

/** Internal notes of the staff about the customer (hidden from the customer). */
export function NotesCard({ customerId }: { customerId: number }) {
  const { t } = useTranslation();
  const { message } = App.useApp();
  const notes = useCustomerNotesQuery(customerId);
  const add = useAddCustomerNote(customerId);
  const [adding, setAdding] = useState(false);
  const [text, setText] = useState("");

  const submit = () =>
    add.mutate(text.trim(), {
      onSuccess: () => {
        setText("");
        setAdding(false);
      },
      onError: (error) => message.error(getErrorMessage(error)),
    });

  return (
    <SectionCard
      title={t("customers.notes.title")}
      extra={
        <button
          type="button"
          disabled={!CUSTOMER_API.notes}
          onClick={() => setAdding(true)}
          className="cursor-pointer border-0 bg-transparent p-0 text-sm font-medium text-brand disabled:cursor-not-allowed disabled:text-slate-400"
          title={CUSTOMER_API.notes ? undefined : t("customers.soon")}
        >
          + {t("customers.notes.add")}
        </button>
      }
    >
      <div className="mb-3 text-xs text-slate-500">{t("customers.notes.hint")}</div>
      {adding && (
        <div className="mb-3 flex flex-col gap-2">
          <Input.TextArea
            autoFocus
            rows={3}
            maxLength={1000}
            value={text}
            placeholder={t("customers.notes.placeholder")}
            onChange={(event) => setText(event.target.value)}
          />
          <div className="flex justify-end gap-2">
            <Button onClick={() => setAdding(false)}>{t("common.cancel")}</Button>
            <Button type="primary" loading={add.isPending} disabled={!text.trim()} onClick={submit}>
              {t("customers.save")}
            </Button>
          </div>
        </div>
      )}
      {!CUSTOMER_API.notes ? (
        <CardEmpty>{t("customers.soon")}</CardEmpty>
      ) : notes.isPending ? (
        <Skeleton active paragraph={{ rows: 2 }} title={false} />
      ) : notes.data?.length ? (
        <ul className="m-0 flex list-none flex-col gap-3 p-0">
          {notes.data.map((note) => (
            <li key={note.id} className="rounded-lg bg-slate-50 px-3 py-2.5">
              <div className="text-sm whitespace-pre-wrap">{note.text}</div>
              <div className="mt-1 text-xs text-slate-500">
                {note.author} · {formatDateTime(note.createdAt)}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <CardEmpty>{t("customers.notes.empty")}</CardEmpty>
      )}
    </SectionCard>
  );
}
