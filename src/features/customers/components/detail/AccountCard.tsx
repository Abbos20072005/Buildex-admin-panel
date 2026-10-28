import { useTranslation } from "react-i18next";
import { formatDate, formatDateTime } from "@/shared/lib/format";
import { useConfirmLogoutAll } from "../../hooks/useConfirmLogoutAll";
import { CUSTOMER_API } from "../../model/capabilities";
import type { Customer } from "../../model/types";
import { channelLabel, CustomerStateTag } from "../columns";
import { InfoRow, SectionCard } from "./SectionCard";

/** State, registration, last login and the active devices. */
export function AccountCard({ customer }: { customer: Customer }) {
  const { t } = useTranslation();
  const logoutEverywhere = useConfirmLogoutAll(customer.id);
  const dash = <span className="text-slate-400">—</span>;

  return (
    <SectionCard title={t("customers.account.title")} flush>
      <div className="px-5">
        <InfoRow label={t("customers.account.state")}>
          <CustomerStateTag item={customer} />
        </InfoRow>
        <InfoRow label={t("customers.account.registered")}>
          {formatDate(customer.createdAt)}
          {" · "}
          {channelLabel(customer.channel, t)}
        </InfoRow>
        <InfoRow label={t("customers.account.lastLogin")}>
          {customer.lastLogin ? formatDateTime(customer.lastLogin) : dash}
          {" · "}
          {CUSTOMER_API.devices && customer.lastLoginPlatform ? (
            channelLabel(customer.lastLoginPlatform, t)
          ) : (
            <span className="text-xs text-slate-400">{t("customers.soonShort")}</span>
          )}
        </InfoRow>
        <InfoRow label={t("customers.account.devices")} last>
          {CUSTOMER_API.devices && customer.activeDevices !== null ? (
            <span className="flex items-center gap-3">
              <span className="font-semibold text-brand">
                {t("customers.account.devicesCount", { count: customer.activeDevices })}
              </span>
              <button
                type="button"
                onClick={logoutEverywhere}
                className="cursor-pointer border-0 bg-transparent p-0 text-sm text-red-600"
              >
                {t("customers.logoutAll")}
              </button>
            </span>
          ) : (
            <span className="text-slate-400">{t("customers.soon")}</span>
          )}
        </InfoRow>
      </div>
    </SectionCard>
  );
}
