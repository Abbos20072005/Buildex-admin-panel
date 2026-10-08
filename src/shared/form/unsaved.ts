import { App } from "antd";
import { useCallback } from "react";
import { useTranslation } from "react-i18next";

/** Forms that have unsaved edits right now (an open editor registers itself while it is dirty). */
const dirtyForms = new Set<string>();

export const setFormDirty = (id: string, dirty: boolean) => {
  if (dirty) dirtyForms.add(id);
  else dirtyForms.delete(id);
};

/** "Unsaved changes — leave anyway?" dialog. */
export function useConfirmDiscard() {
  const { t } = useTranslation();
  const { modal } = App.useApp();

  return useCallback(
    (onDiscard: () => void, onStay?: () => void) =>
      modal.confirm({
        title: t("common.unsavedTitle"),
        content: t("common.unsavedText"),
        okText: t("common.discard"),
        okButtonProps: { danger: true },
        cancelText: t("common.cancel"),
        onOk: onDiscard,
        onCancel: onStay,
      }),
    [modal, t],
  );
}

/**
 * For a list page next to an editor panel: wrap what opens another record (or closes the
 * panel), and it asks first while the open editor has unsaved edits.
 */
export function useConfirmIfDirty() {
  const confirmDiscard = useConfirmDiscard();
  return useCallback(
    (action: () => void) => (dirtyForms.size > 0 ? confirmDiscard(action) : action()),
    [confirmDiscard],
  );
}
