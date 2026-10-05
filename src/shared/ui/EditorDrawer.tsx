import { Button, Drawer, Popconfirm, Skeleton } from "antd";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";

interface Props {
  title: string;
  onClose: () => void;
  onSave: () => void;
  saving: boolean;
  /** the saved item is still loading */
  loading?: boolean;
  /** only for an existing item */
  onDelete?: () => void;
  deleting?: boolean;
  deleteConfirm?: string;
  children: ReactNode;
}

/** Side drawer for creating / editing one record: title, the form, "Delete" / "Cancel" / "Save". */
export function EditorDrawer({
  title,
  onClose,
  onSave,
  saving,
  loading,
  onDelete,
  deleting,
  deleteConfirm,
  children,
}: Props) {
  const { t } = useTranslation();

  return (
    <Drawer
      open
      size={680}
      // never wider than a phone screen
      rootClassName="[&_.ant-drawer-content-wrapper]:max-w-screen"
      title={<span className="text-base font-bold">{title}</span>}
      onClose={onClose}
      destroyOnHidden
      footer={
        <div className="flex items-center justify-between gap-3">
          {onDelete ? (
            <Popconfirm
              title={deleteConfirm}
              okText={t("common.delete")}
              okButtonProps={{ danger: true }}
              cancelText={t("common.cancel")}
              onConfirm={onDelete}
            >
              <Button danger loading={deleting}>
                {t("common.delete")}
              </Button>
            </Popconfirm>
          ) : (
            <span />
          )}
          <div className="flex gap-2">
            <Button onClick={onClose}>{t("common.cancel")}</Button>
            <Button type="primary" loading={saving} disabled={loading} onClick={onSave}>
              {t("common.save")}
            </Button>
          </div>
        </div>
      }
    >
      {loading ? <Skeleton active paragraph={{ rows: 8 }} /> : children}
    </Drawer>
  );
}
