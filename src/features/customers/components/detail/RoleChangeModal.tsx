import { App, Input, Modal } from "antd";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { getErrorMessage } from "@/shared/api";
import { useChangeCustomerRole } from "../../hooks/queries";
import type { Customer } from "../../model/types";

interface Props {
  customer: Customer;
  onClose: () => void;
}

/** Makes the customer PRO, or takes PRO away: the reason is required for the second one. */
export function RoleChangeModal({ customer, onClose }: Props) {
  const { t } = useTranslation();
  const { message } = App.useApp();
  const change = useChangeCustomerRole();
  const [reason, setReason] = useState("");

  const revoke = customer.role === "prorab";
  const missingReason = revoke && !reason.trim();

  const submit = () =>
    change.mutate(
      { id: customer.id, role: revoke ? "user" : "prorab", reason: reason.trim() },
      {
        onSuccess: () => {
          message.success(t("common.saved"));
          onClose();
        },
        onError: (error) => message.error(getErrorMessage(error)),
      },
    );

  return (
    <Modal
      open
      title={t(revoke ? "customers.roleModal.revoke" : "customers.roleModal.grant")}
      okText={t("customers.roleModal.ok")}
      cancelText={t("common.cancel")}
      okButtonProps={{ disabled: missingReason, loading: change.isPending, danger: revoke }}
      onOk={submit}
      onCancel={onClose}
    >
      <div className="mb-2 text-sm text-slate-600">{customer.fullName || customer.phone}</div>
      <Input.TextArea
        rows={3}
        maxLength={300}
        placeholder={t(
          revoke ? "customers.roleModal.reasonRequired" : "customers.roleModal.reason",
        )}
        value={reason}
        onChange={(event) => setReason(event.target.value)}
      />
    </Modal>
  );
}
