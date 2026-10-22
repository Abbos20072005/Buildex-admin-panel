import { App, Modal, Select } from "antd";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useCustomersQuery } from "@/features/customers";
import { ApiError, getErrorMessage } from "@/shared/api";
import { formatPhone } from "@/shared/lib/format";
import { useDebouncedValue } from "@/shared/lib/useDebouncedValue";
import { useCreateChat } from "../hooks/queries";

interface Props {
  onClose: () => void;
  /** the new chat's id */
  onCreated: (id: number) => void;
}

/** The operator starts a conversation with a customer (a customer has at most one chat). */
export function NewChatModal({ onClose, onCreated }: Props) {
  const { t } = useTranslation();
  const { message } = App.useApp();
  const create = useCreateChat();
  const [search, setSearch] = useState("");
  const [customerId, setCustomerId] = useState<number | null>(null);
  const found = useCustomersQuery({
    filters: { search: useDebouncedValue(search.trim(), 300) || undefined },
    page: 1,
    pageSize: 20,
  });

  const submit = () => {
    if (customerId === null) return;
    create.mutate(customerId, {
      onSuccess: (chat) => {
        message.success(t("chats.toast.chatCreated"));
        onCreated(chat.id);
      },
      onError: (error) =>
        message.error(
          error instanceof ApiError && (error.body as { customer?: unknown } | null)?.customer
            ? t("chats.toast.alreadyExists")
            : getErrorMessage(error),
        ),
    });
  };

  return (
    <Modal
      open
      title={t("chats.newChat.title")}
      okText={t("chats.newChat.create")}
      okButtonProps={{ disabled: customerId === null, loading: create.isPending }}
      cancelText={t("common.cancel")}
      onOk={submit}
      onCancel={onClose}
      destroyOnHidden
    >
      <p className="mt-0 text-sm text-slate-500">{t("chats.newChat.hint")}</p>
      <Select<number>
        showSearch={{ filterOption: false, onSearch: setSearch }}
        className="w-full"
        placeholder={t("chats.newChat.placeholder")}
        loading={found.isFetching}
        value={customerId ?? undefined}
        onChange={setCustomerId}
        notFoundContent={t("common.noData")}
        options={(found.data?.items ?? []).map((customer) => ({
          value: customer.id,
          label: `${customer.fullName || "—"} · ${formatPhone(customer.phone)}`,
        }))}
      />
    </Modal>
  );
}
