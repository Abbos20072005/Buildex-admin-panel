import { CloseIcon } from "@/shared/icons";
import { App, Button, Card, Form, Input, Popconfirm, Select } from "antd";
import { useTranslation } from "react-i18next";
import { getErrorMessage } from "@/shared/api";
import {
  useCreatePartnerBrand,
  useDeletePartnerBrand,
  useUpdatePartnerBrand,
} from "../hooks/queries";
import type { PartnerBrand, PartnerBrandInput } from "../model/types";

interface Props {
  /** null — a new partner brand is being created */
  item: PartnerBrand | null;
  onClose: () => void;
}

/** Side panel: create / edit one partner brand (name and status). */
export function PartnerBrandEditor({ item, onClose }: Props) {
  const { t } = useTranslation();
  const { message } = App.useApp();
  const [form] = Form.useForm<PartnerBrandInput>();

  const create = useCreatePartnerBrand();
  const update = useUpdatePartnerBrand();
  const remove = useDeletePartnerBrand();

  const handleSave = async () => {
    try {
      await form.validateFields();
    } catch {
      return;
    }
    const input = form.getFieldsValue(true) as PartnerBrandInput;
    const done = {
      onSuccess: () => {
        message.success(t("partnerBrands.saved"));
        onClose();
      },
      onError: (error: unknown) => message.error(getErrorMessage(error)),
    };
    if (item) update.mutate({ id: item.id, input }, done);
    else create.mutate(input, done);
  };

  const handleDelete = () => {
    if (!item) return;
    remove.mutate(item.id, {
      onSuccess: () => {
        message.success(t("partnerBrands.deleted"));
        onClose();
      },
      onError: (error) => message.error(getErrorMessage(error)),
    });
  };

  return (
    <Card
      className="sticky top-20"
      styles={{ body: { padding: 0 } }}
      title={
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 truncate text-base font-bold">
            {item ? item.name : t("partnerBrands.newTitle")}
          </div>
          <Button
            type="text"
            icon={<CloseIcon />}
            onClick={onClose}
            aria-label={t("common.cancel")}
          />
        </div>
      }
    >
      <Form
        form={form}
        layout="vertical"
        requiredMark={false}
        initialValues={{ name: item?.name ?? "", isActive: item?.isActive ?? true }}
        className="px-5 py-4"
      >
        <Form.Item
          name="name"
          label={
            <>
              {t("partnerBrands.name")} <span className="text-red-600">*</span>
            </>
          }
          rules={[{ required: true, whitespace: true, message: t("partnerBrands.required") }]}
        >
          <Input maxLength={255} />
        </Form.Item>
        <Form.Item name="isActive" label={t("partnerBrands.status")} className="mb-0">
          <Select
            options={[
              { value: true, label: t("partnerBrands.active") },
              { value: false, label: t("partnerBrands.inactive") },
            ]}
          />
        </Form.Item>
      </Form>

      <div className="flex items-center justify-between gap-3 border-t border-slate-100 px-5 py-3">
        {item ? (
          <Popconfirm
            title={t("partnerBrands.deleteConfirm")}
            okText={t("common.delete")}
            okButtonProps={{ danger: true }}
            cancelText={t("common.cancel")}
            onConfirm={handleDelete}
          >
            <Button danger loading={remove.isPending}>
              {t("common.delete")}
            </Button>
          </Popconfirm>
        ) : (
          <span />
        )}
        <div className="flex gap-2">
          <Button onClick={onClose}>{t("common.cancel")}</Button>
          <Button
            type="primary"
            loading={create.isPending || update.isPending}
            onClick={() => void handleSave()}
          >
            {t("partnerBrands.save")}
          </Button>
        </div>
      </div>
    </Card>
  );
}
