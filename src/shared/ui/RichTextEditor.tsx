import { BoldIcon, ItalicIcon, ListOrderedIcon, UnderlineIcon, ListIcon } from "@/shared/icons";
import { Button } from "antd";
import DOMPurify from "dompurify";
import { useEffect, useRef, type ReactNode } from "react";

interface Props {
  value?: string;
  onChange?: (html: string) => void;
  /** min height of the writing area, px */
  minHeight?: number;
}

const COMMANDS: { command: string; icon: ReactNode; label: string }[] = [
  { command: "bold", icon: <BoldIcon />, label: "Bold" },
  { command: "italic", icon: <ItalicIcon />, label: "Italic" },
  { command: "underline", icon: <UnderlineIcon />, label: "Underline" },
  { command: "insertUnorderedList", icon: <ListIcon />, label: "Bullet list" },
  { command: "insertOrderedList", icon: <ListOrderedIcon />, label: "Numbered list" },
];

const clean = (html: string) => DOMPurify.sanitize(html);

/**
 * The text is stored as HTML on the backend, so it is shown formatted (tables, lists, bold…)
 * and edited in place instead of as raw tags. Works as an antd `Form.Item` control.
 */
export function RichTextEditor({ value = "", onChange, minHeight = 120 }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  /** last html this editor produced — a different `value` comes from outside (reset, save) */
  const emitted = useRef<string | null>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node || value === emitted.current) return;
    node.innerHTML = clean(value);
    emitted.current = value;
  }, [value]);

  const emit = () => {
    const html = ref.current?.innerHTML ?? "";
    emitted.current = html;
    onChange?.(html);
  };

  const run = (command: string) => {
    ref.current?.focus();
    document.execCommand(command);
    emit();
  };

  return (
    <div className="overflow-hidden rounded-lg border border-slate-300 focus-within:border-brand">
      <div className="flex gap-1 border-b border-slate-200 bg-surface-alt px-2 py-1">
        {COMMANDS.map(({ command, icon, label }) => (
          <Button
            key={command}
            size="small"
            type="text"
            icon={icon}
            aria-label={label}
            // keep the text selection while the button is pressed
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => run(command)}
          />
        ))}
      </div>
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        role="textbox"
        aria-multiline
        onInput={emit}
        onPaste={(event) => {
          // paste as clean HTML, without foreign styles
          const html = event.clipboardData.getData("text/html");
          if (!html) return;
          event.preventDefault();
          document.execCommand("insertHTML", false, clean(html));
        }}
        style={{ minHeight }}
        className="rich-content max-h-[420px] overflow-auto px-3 py-2 outline-none"
      />
    </div>
  );
}
