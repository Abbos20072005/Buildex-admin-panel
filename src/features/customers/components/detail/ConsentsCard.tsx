import { Tag } from "antd";
import { useTranslation } from "react-i18next";
import { formatDate } from "@/shared/lib/format";
import { CUSTOMER_API } from "../../model/capabilities";
import { CONSENT_KEYS, type Customer } from "../../model/types";
import { CardEmpty, SectionCard } from "./SectionCard";

/** What the customer agreed to receive: push, SMS ads, e-mail news (changed by the customer only). */
export function ConsentsCard({ customer }: { customer: Customer }) {
  const { t } = useTranslation();
  return (
    <SectionCard title={t("customers.consents.title")} flush>
      {!CUSTOMER_API.consents ? (
        <div className="px-5 pb-3">
          <CardEmpty>{t("customers.soon")}</CardEmpty>
        </div>
      ) : (
        <ul className="m-0 list-none p-0">
          {CONSENT_KEYS.map((key) => {
            const consent = customer.consents[key];
            return (
              <li
                key={key}
                className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-3"
              >
                <div>
                  <div className="text-sm font-semibold">{t(`customers.consents.${key}`)}</div>
                  <div className="text-xs text-slate-500">
                    {consent?.changedAt
                      ? t("customers.consents.changed", { date: formatDate(consent.changedAt) })
                      : "—"}
                  </div>
                </div>
                {consent && (
                  <Tag
                    color={consent.enabled ? "green" : "default"}
                    variant="filled"
                    className="m-0"
                  >
                    {t(consent.enabled ? "customers.consents.on" : "customers.consents.off")}
                  </Tag>
                )}
              </li>
            );
          })}
        </ul>
      )}
      <div className="px-5 py-3 text-xs text-slate-500">{t("customers.consents.note")}</div>
    </SectionCard>
  );
}
