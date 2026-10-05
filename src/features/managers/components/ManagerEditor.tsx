import { App, Form, Input, Switch } from "antd";
import { useTranslation } from "react-i18next";
import { getErrorMessage } from "@/shared/api";
import { EditorDrawer } from "@/shared/ui";
import { useCreateManager, useDeleteManager, useUpdateManager } from "../hooks/queries";
import type { Manager, ManagerInput } from "../model/types";

interface Props {
  /** null — a new manager is being created */
  item: Manager | null;
  onClose: () => void;
}

/** Create / edit one manager: full name and whether they can be assigned to orders. */
export function ManagerEditor({ item, onClose }: Props) {
  const { t } = useTranslation();
  const { message } = App.useApp();
  const [form] = Form.useForm<ManagerInput>();

  const create = useCreateManager();
  const update = useUpdateManager();
  const remove = useDeleteManager();

  const done = {
    onSuccess: () => {
      message.success(t("common.saved"));
      onClose();
    },
    onError: (error: unknown) => message.error(getErrorMessage(error)),
  };

  const handleSave = async () => {
    let input: ManagerInput;
    try {
      input = await form.validateFields();
    } catch {
      return;
    }
    if (item) update.mutate({ id: item.id, input }, done);
    else create.mutate(input, done);
  };

  const handleDelete = () => {
    if (!item) return;
    remove.mutate(item.id, {
      onSuccess: () => {
        message.success(t("common.deleted"));
        onClose();
      },
      onError: (error) => message.error(getErrorMessage(error)),
    });
  };

  return (
    <EditorDrawer
      size={420}
      title={item ? item.fullName : t("managers.newTitle")}
      onClose={onClose}
      onSave={() => void handleSave()}
      saving={create.isPending || update.isPending}
      onDelete={item ? handleDelete : undefined}
      deleting={remove.isPending}
      deleteConfirm={t("managers.deleteConfirm")}
    >
      <Form
        form={form}
        layout="vertical"
        requiredMark={false}
        initialValues={{ fullName: item?.fullName ?? "", isActive: item?.isActive ?? true }}
      >
        <Form.Item
          name="fullName"
          label={
            <>
              {t("managers.fullName")} <span className="text-red-600">*</span>
            </>
          }
          rules={[{ required: true, whitespace: true, message: t("managers.required") }]}
        >
          <Input maxLength={255} autoFocus />
        </Form.Item>
        <Form.Item
          name="isActive"
          label={t("managers.active")}
          valuePropName="checked"
          extra={t("managers.activeHint")}
          className="mb-0"
        >
          <Switch />
        </Form.Item>
      </Form>
    </EditorDrawer>
  );
}
