import { App, type FormInstance } from "antd";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useBlocker } from "react-router-dom";
import { ApiError } from "@/shared/api";
import { applyServerErrors, type FieldMap } from "./serverErrors";
import { setFormDirty, useConfirmDiscard } from "./unsaved";

/** Seconds a conflict message stays: it has to be read, not glanced at. */
const CONFLICT_SECONDS = 8;

/**
 * The shared behaviour of every editing form:
 * - `dirty` — the form has unsaved edits; leaving (closing, a link, the sidebar, closing the
 *   tab) asks first;
 * - `showError` — a failed save: field errors appear next to their fields, a 409 says the record
 *   was changed elsewhere and keeps what was typed, anything else is a toast;
 * - `saved` — call it before closing / navigating after a successful save.
 *
 * Lock the form while saving with `<Form disabled={saving}>`.
 */
export function useEditorForm<T>(form: FormInstance<T>, fieldMap?: FieldMap) {
  const { t } = useTranslation();
  const { message } = App.useApp();
  const id = useId();
  const confirmDiscard = useConfirmDiscard();
  const [dirty, setDirtyState] = useState(false);
  const dirtyRef = useRef(false);

  const setDirty = useCallback(
    (value: boolean) => {
      dirtyRef.current = value;
      setFormDirty(id, value);
      setDirtyState(value);
    },
    [id],
  );
  // an editor that disappears (closed, replaced by another record) is no longer dirty
  useEffect(() => () => setFormDirty(id, false), [id]);

  // closing the tab / reloading with unsaved edits
  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  // leaving to another page (a link, the sidebar, the back button)
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      dirtyRef.current && currentLocation.pathname !== nextLocation.pathname,
  );
  useEffect(() => {
    if (blocker.state !== "blocked") return;
    confirmDiscard(
      () => {
        setDirty(false);
        blocker.proceed();
      },
      () => blocker.reset(),
    );
  }, [blocker, confirmDiscard, setDirty]);

  return {
    dirty,
    /** spread on <Form>: marks the form dirty on any edit */
    formProps: { onValuesChange: () => setDirty(true) },
    markDirty: () => setDirty(true),
    /** the save went through: nothing is unsaved any more */
    saved: () => setDirty(false),
    /** runs `action` at once, or after the user agrees to drop the unsaved edits */
    confirmClose: (action: () => void) => (dirtyRef.current ? confirmDiscard(action) : action()),
    showError: (error: unknown) => {
      if (error instanceof ApiError && error.status === 409) {
        message.error({ content: t("common.conflict"), duration: CONFLICT_SECONDS });
        return;
      }
      const rest = applyServerErrors(form, error, fieldMap);
      if (rest) message.error(rest);
    },
  };
}
