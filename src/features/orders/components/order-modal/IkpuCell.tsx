import { App, Button, Input, Modal, Tag } from "antd";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { getErrorMessage } from "@/shared/api";
import { useSetOrderItemIkpu } from "../../hooks/queries";
import { IKPU_PATTERN } from "../../lib/ikpu";
import type { OrderItem } from "../../model/types";

interface Props {
  orderId: number;
  item: OrderItem;
  /** false once the order is confirmed: the code is only shown */
  editable: boolean;
}

/** The IKPU code of an order line: shown, or marked when missing; a new order can edit it. */
export function IkpuCell({ orderId, item, editable }: Props) {
  const { t } = useTranslation();
  const { message } = App.useApp();
  const save = useSetOrderItemIkpu(orderId);
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");

  // the API does not send the code yet
  if (item.ikpuCode === undefined) return <>—</>;

  const missing = item.ikpuCode === "";
  const valid = IKPU_PATTERN.test(value);

  const openEditor = () => {
    setValue(item.ikpuCode ?? "");
    setOpen(true);
  };

  const submit = () =>
    save.mutate(
      { itemId: item.id, ikpuCode: value },
      {
        onSuccess: () => {
          setOpen(false);
          message.success(t("orders.modal.ikpuSaved"));
        },
        onError: (error) => message.error(getErrorMessage(error)),
      },
    );

  return (
    <div className="flex flex-col items-start gap-1">
      {missing ? (
        <Tag color="red" className="m-0">
          {t("orders.modal.ikpuMissing")}
        </Tag>
      ) : (
        <span className="font-mono text-xs">{item.ikpuCode}</span>
      )}
      {editable && (
        <Button type="link" size="small" className="h-auto p-0" onClick={openEditor}>
          {t(missing ? "orders.modal.ikpuAdd" : "orders.modal.ikpuEdit")}
        </Button>
      )}

      <Modal
        open={open}
        title={t("orders.modal.ikpuTitle")}
        okText={t("common.save")}
        cancelText={t("common.cancel")}
        okButtonProps={{ disabled: !valid, loading: save.isPending }}
        onOk={submit}
        onCancel={() => setOpen(false)}
        destroyOnHidden
      >
        <div className="mb-2 font-medium">{item.name}</div>
        <Input
          autoFocus
          inputMode="numeric"
          maxLength={17}
          placeholder="00000000000000000"
          className="font-mono"
          value={value}
          status={value && !valid ? "error" : undefined}
          onChange={(event) => setValue(event.target.value.replace(/\D/g, ""))}
          onPressEnter={() => valid && submit()}
        />
        <div className="mt-1 text-xs text-slate-500">
          {value && !valid ? t("orders.modal.ikpuInvalid") : t("orders.modal.ikpuHint")}{" "}
          <a href="https://tasnif.soliq.uz" target="_blank" rel="noreferrer">
            tasnif.soliq.uz
          </a>
        </div>
        <div className="mt-3 rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-800">
          {t("orders.modal.ikpuNotice")}
        </div>
      </Modal>
    </div>
  );
}
