import { Button } from "antd";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { formatPhone, maskPhone, telHref } from "@/shared/lib/format";

/** Shows a masked phone number; "Show" reveals it as a tel: link. */
export function PhoneReveal({ phone }: { phone: string }) {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);

  if (!phone) return <>—</>;

  return (
    <span className="inline-flex items-center gap-2">
      {visible ? (
        <a href={telHref(phone)} className="font-mono">
          {formatPhone(phone)}
        </a>
      ) : (
        <span className="font-mono">{maskPhone(phone)}</span>
      )}
      <Button
        type="link"
        size="small"
        className="p-0 font-semibold"
        onClick={() => setVisible((v) => !v)}
      >
        {visible ? t("orders.modal.hide") : t("orders.modal.show")}
      </Button>
    </span>
  );
}
