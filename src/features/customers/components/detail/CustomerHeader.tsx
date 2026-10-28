import { App, Button, Dropdown, Tag } from "antd";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { getErrorMessage } from "@/shared/api";
import { ChevronLeftIcon, MoreIcon } from "@/shared/icons";
import { formatDate, formatNumber } from "@/shared/lib/format";
import { InitialsAvatar } from "@/shared/ui";
import { useSetCustomerBlocked } from "../../hooks/queries";
import { useConfirmLogoutAll } from "../../hooks/useConfirmLogoutAll";
import { CUSTOMER_API } from "../../model/capabilities";
import type { Customer } from "../../model/types";
import { channelLabel, CustomerStateTag } from "../columns";
import { RoleChangeModal } from "./RoleChangeModal";

/** Back button, avatar, name with the state, the registration line, "Bloklash" and the "⋯" menu. */
export function CustomerHeader({ customer }: { customer: Customer }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { message, modal } = App.useApp();
  const block = useSetCustomerBlocked();
  const logoutEverywhere = useConfirmLogoutAll(customer.id);
  const [roleOpen, setRoleOpen] = useState(false);

  const toggleBlocked = () =>
    modal.confirm({
      title: t(customer.isBlocked ? "customers.unblockConfirm" : "customers.blockConfirm"),
      content: customer.isBlocked ? undefined : t("customers.blockedHint"),
      okText: t(customer.isBlocked ? "customers.unblock" : "customers.block"),
      okButtonProps: customer.isBlocked ? { className: "btn-success" } : { danger: true },
      cancelText: t("common.cancel"),
      onOk: () =>
        block.mutateAsync({ id: customer.id, value: !customer.isBlocked }).then(
          () => message.success(t("common.saved")),
          (error: unknown) => message.error(getErrorMessage(error)),
        ),
    });

  return (
    <>
      <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button
            icon={<ChevronLeftIcon />}
            aria-label={t("customers.back")}
            onClick={() => navigate("/customers")}
          />
          <InitialsAvatar
            name={customer.fullName || customer.phone}
            src={customer.avatar}
            size={56}
          />
          <div>
            <div className="font-mono text-xs text-slate-500">
              {t("nav.customers")} / ID {formatNumber(customer.id)}
            </div>
            <div className="flex items-center gap-3">
              <h1 className="m-0 text-2xl font-bold tracking-tight">
                {customer.fullName || customer.phone}
              </h1>
              <CustomerStateTag item={customer} />
              {customer.role === "prorab" && (
                <Tag color="blue" variant="filled" className="m-0 font-bold">
                  {t("role.prorab")}
                </Tag>
              )}
            </div>
            <div className="text-sm text-slate-500">
              {t("customers.registeredAt", { date: formatDate(customer.createdAt) })}
              {" · "}
              {channelLabel(customer.channel, t)}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* blocking is destructive (red), unblocking is constructive (green) */}
          <Button
            danger={!customer.isBlocked}
            className={customer.isBlocked ? "btn-success" : undefined}
            loading={block.isPending}
            onClick={toggleBlocked}
          >
            {t(customer.isBlocked ? "customers.unblock" : "customers.block")}
          </Button>
          <Dropdown
            trigger={["click"]}
            placement="bottomRight"
            menu={{
              items: [
                {
                  key: "role",
                  label: t(
                    customer.role === "prorab" ? "customers.revokePro" : "customers.makePro",
                  ),
                },
                {
                  key: "logout",
                  label: t("customers.logoutAll"),
                  disabled: !CUSTOMER_API.devices,
                  title: CUSTOMER_API.devices ? undefined : t("customers.soon"),
                },
              ],
              onClick: ({ key }) => (key === "role" ? setRoleOpen(true) : logoutEverywhere()),
            }}
          >
            <Button icon={<MoreIcon />} aria-label={t("common.actions")} />
          </Dropdown>
        </div>
      </div>
      {roleOpen && <RoleChangeModal customer={customer} onClose={() => setRoleOpen(false)} />}
    </>
  );
}
