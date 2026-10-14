import { Input, Modal } from "antd";
import { useState } from "react";
import { useTranslation } from "react-i18next";

const MAX = 1000;

interface Props {
  productName: string;
  loading: boolean;
  onCancel: () => void;
  onConfirm: (reason: string) => void;
}

/** A rejection needs a reason: the content team reads it on the product page. */
export function RejectModal({ productName, loading, onCancel, onConfirm }: Props) {
  const { t } = useTranslation();
  const [reason, setReason] = useState("");
  const trimmed = reason.trim();

  return (
    <Modal
      open
      title={t("moderation.rejectTitle")}
      okText={t("moderation.reject")}
      okButtonProps={{ danger: true, disabled: trimmed.length === 0, loading }}
      cancelText={t("common.cancel")}
      onOk={() => onConfirm(trimmed)}
      onCancel={onCancel}
      destroyOnHidden
    >
      <p className="mt-0 text-sm text-slate-600">{productName}</p>
      <Input.TextArea
        autoFocus
        rows={4}
        showCount
        maxLength={MAX}
        placeholder={t("moderation.reasonPlaceholder")}
        value={reason}
        onChange={(event) => setReason(event.target.value)}
      />
    </Modal>
  );
}
