import { App, Button, Input, Select, Tag } from "antd";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { getErrorMessage } from "@/shared/api";
import { CheckIcon, LockIcon } from "@/shared/icons";
import { formatPhone } from "@/shared/lib/format";
import { usePatchCustomerProfile, useRevealCustomerPhone } from "../../hooks/queries";
import { CUSTOMER_LANGUAGES, CUSTOMER_ROLES, type Customer } from "../../model/types";
import { RoleChangeModal } from "./RoleChangeModal";
import { InfoRow, SectionCard } from "./SectionCard";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Name, e-mail and language (editable), the phone (masked until "Ko'rsatish"). */
export function ProfileCard({ customer }: { customer: Customer }) {
  const { t } = useTranslation();
  const { message } = App.useApp();
  const patch = usePatchCustomerProfile();
  const reveal = useRevealCustomerPhone();
  const [name, setName] = useState(customer.fullName);
  const [email, setEmail] = useState(customer.email);
  const [language, setLanguage] = useState(customer.language ?? undefined);
  /** the whole number, once the server has given it (each reveal is written to the journal) */
  const [phone, setPhone] = useState<string>();
  const [roleOpen, setRoleOpen] = useState(false);

  const emailInvalid = email.trim() !== "" && !EMAIL_PATTERN.test(email.trim());
  const dirty =
    name.trim() !== customer.fullName ||
    email.trim() !== customer.email ||
    language !== (customer.language ?? undefined);

  const save = () =>
    patch.mutate(
      {
        id: customer.id,
        patch: {
          fullName: name,
          // only what was changed goes to the server
          ...(email.trim() !== customer.email ? { email } : {}),
          ...(language !== (customer.language ?? undefined) && language ? { language } : {}),
        },
      },
      {
        onSuccess: () => message.success(t("common.saved")),
        onError: (error) => message.error(getErrorMessage(error)),
      },
    );

  const toggleHidden = () => {
    if (phone) return setPhone(undefined);
    reveal.mutate(customer.id, {
      onSuccess: setPhone,
      onError: (error) => message.error(getErrorMessage(error)),
    });
  };

  return (
    <SectionCard title={t("customers.profile.title")} flush>
      <div className="px-5">
        <InfoRow label={t("customers.profile.name")}>
          <Input maxLength={150} value={name} onChange={(event) => setName(event.target.value)} />
        </InfoRow>
        <InfoRow label={t("customers.profile.phone")}>
          <div className="flex flex-wrap items-center gap-3">
            {/* the list and the card get the number masked: "+998 90 *** ** 67" */}
            <span className="font-mono">{phone ? formatPhone(phone) : customer.phone}</span>
            <button
              type="button"
              disabled={reveal.isPending}
              onClick={toggleHidden}
              className="cursor-pointer border-0 bg-transparent p-0 text-sm font-medium text-brand disabled:cursor-wait disabled:text-slate-400"
            >
              {t(phone ? "customers.profile.hide" : "customers.profile.show")}
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
        <InfoRow label={t("customers.profile.role")}>
          {/* the role changes only through POST role/: the choice opens the confirmation (with a reason) */}
          <Select
            className="w-full"
            value={customer.role}
            onChange={(role) => role !== customer.role && setRoleOpen(true)}
            options={CUSTOMER_ROLES.map((key) => ({ value: key, label: t(`role.${key}`) }))}
          />
        </InfoRow>
        <InfoRow label={t("customers.profile.email")}>
          <Input
            type="email"
            maxLength={254}
            status={emailInvalid ? "error" : undefined}
            placeholder={t("customers.profile.optional")}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </InfoRow>
        <InfoRow label={t("customers.profile.language")} last>
          <Select
            className="w-full"
            value={language}
            placeholder="—"
            onChange={setLanguage}
            options={CUSTOMER_LANGUAGES.map((key) => ({
              value: key,
              label: t(`customers.languages.${key}`),
            }))}
          />
        </InfoRow>
      </div>
      {dirty && (
        <div className="flex justify-end gap-2 border-t border-slate-200 px-5 py-3">
          <Button
            onClick={() => {
              setName(customer.fullName);
              setEmail(customer.email);
              setLanguage(customer.language ?? undefined);
            }}
          >
            {t("common.cancel")}
          </Button>
          <Button
            type="primary"
            loading={patch.isPending}
            disabled={!name.trim() || emailInvalid}
            onClick={save}
          >
            {t("customers.save")}
          </Button>
        </div>
      )}
      {roleOpen && <RoleChangeModal customer={customer} onClose={() => setRoleOpen(false)} />}
    </SectionCard>
  );
}
