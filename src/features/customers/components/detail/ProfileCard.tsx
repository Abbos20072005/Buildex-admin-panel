import { App, Button, Input, Select, Tag } from "antd";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { getErrorMessage } from "@/shared/api";
import { CheckIcon, LockIcon } from "@/shared/icons";
import { formatPhone, maskPhone } from "@/shared/lib/format";
import { usePatchCustomerProfile } from "../../hooks/queries";
import { CUSTOMER_API } from "../../model/capabilities";
import type { Customer } from "../../model/types";
import { InfoRow, SectionCard } from "./SectionCard";

const LANGUAGES = ["uz", "ru", "en"];

/** Name (editable), phone (hidden until "Ko'rsatish"), e-mail and language. */
export function ProfileCard({ customer }: { customer: Customer }) {
  const { t } = useTranslation();
  const { message } = App.useApp();
  const patch = usePatchCustomerProfile();
  const [name, setName] = useState(customer.fullName);
  const [phoneShown, setPhoneShown] = useState(false);

  const dirty = name.trim() !== customer.fullName;
  const save = () =>
    patch.mutate(
      { id: customer.id, patch: { fullName: name } },
      {
        onSuccess: () => message.success(t("common.saved")),
        onError: (error) => message.error(getErrorMessage(error)),
      },
    );

  return (
    <SectionCard title={t("customers.profile.title")} flush>
      <div className="px-5">
        <InfoRow label={t("customers.profile.name")}>
          <Input maxLength={150} value={name} onChange={(event) => setName(event.target.value)} />
        </InfoRow>
        <InfoRow label={t("customers.profile.phone")}>
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-mono">
              {phoneShown ? formatPhone(customer.phone) : maskPhone(customer.phone)}
            </span>
            <button
              type="button"
              onClick={() => setPhoneShown((shown) => !shown)}
              className="cursor-pointer border-0 bg-transparent p-0 text-sm font-medium text-brand"
            >
              {t(phoneShown ? "customers.profile.hide" : "customers.profile.show")}
            </button>
            {customer.verified ? (
              <Tag color="green" variant="filled" icon={<CheckIcon />} className="m-0">
                {t("customers.profile.verified")}
              </Tag>
            ) : (
              <Tag color="gold" variant="filled" className="m-0">
                {t("customers.profile.unverified")}
              </Tag>
            )}
            <LockIcon className="size-3.5 text-slate-400" />
          </div>
        </InfoRow>
        <InfoRow label={t("customers.profile.email")}>
          <Input
            disabled={!CUSTOMER_API.profileFields}
            placeholder={t(
              CUSTOMER_API.profileFields ? "customers.profile.optional" : "customers.soon",
            )}
            value={customer.email}
            readOnly
          />
        </InfoRow>
        <InfoRow label={t("customers.profile.language")} last>
          <Select
            className="w-full"
            disabled={!CUSTOMER_API.profileFields}
            value={customer.language ?? undefined}
            placeholder={t(
              CUSTOMER_API.profileFields ? "customers.languages.uz" : "customers.soon",
            )}
            options={LANGUAGES.map((key) => ({
              value: key,
              label: t(`customers.languages.${key}`),
            }))}
          />
        </InfoRow>
      </div>
      {dirty && (
        <div className="flex justify-end gap-2 border-t border-slate-200 px-5 py-3">
          <Button onClick={() => setName(customer.fullName)}>{t("common.cancel")}</Button>
          <Button type="primary" loading={patch.isPending} disabled={!name.trim()} onClick={save}>
            {t("customers.save")}
          </Button>
        </div>
      )}
    </SectionCard>
  );
}
