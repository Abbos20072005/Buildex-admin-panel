import { App } from "antd";
import { useTranslation } from "react-i18next";
import { getErrorMessage } from "@/shared/api";
import { useLogoutCustomerEverywhere } from "./queries";

/** Returns a function that asks for confirmation and signs the customer out on every device. */
export function useConfirmLogoutAll(customerId: number) {
  const { t } = useTranslation();
  const { message, modal } = App.useApp();
  const logout = useLogoutCustomerEverywhere();

  return () =>
    modal.confirm({
      title: t("customers.logoutAllConfirm"),
      okText: t("customers.logoutAll"),
      okButtonProps: { danger: true },
      cancelText: t("common.cancel"),
      onOk: () =>
        logout.mutateAsync(customerId).then(
          () => message.success(t("common.saved")),
          (error: unknown) => message.error(getErrorMessage(error)),
        ),
    });
}
