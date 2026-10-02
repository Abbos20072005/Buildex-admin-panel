import { useEffect } from "react";

const TYPING_TAGS = new Set(["INPUT", "TEXTAREA", "SELECT"]);

/** Runs `handler` when `key` is pressed outside of text inputs (e.g. "/" to focus search). */
export function useHotkey(key: string, handler: () => void) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (
        event.key !== key ||
        !target ||
        TYPING_TAGS.has(target.tagName) ||
        target.isContentEditable
      )
        return;
      event.preventDefault();
      handler();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [key, handler]);
}
