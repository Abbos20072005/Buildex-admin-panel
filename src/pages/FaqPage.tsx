import { PlusIcon } from "@/shared/icons";
import { Button } from "antd";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ItemEditor, ItemsSection, type FaqItem } from "@/features/faq";
import type { FaqCategory } from "@/features/faq/model/types";

/** "Savol-javoblar": the questions of the site and the app, grouped by fixed categories. */
export function FaqPage() {
  const { t } = useTranslation();

  /** the category chosen in the questions' filter — a new question starts in it */
  const [category, setCategory] = useState<FaqCategory>();
  /** an object — that record is edited; "new" — the create form; null — closed */
  const [item, setItem] = useState<FaqItem | "new" | null>(null);

  return (
    <>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-xs text-slate-500">{t("nav.contents")}</div>
          <h1 className="m-0 text-2xl font-bold tracking-tight">{t("nav.faq")}</h1>
        </div>
        <Button type="primary" icon={<PlusIcon />} onClick={() => setItem("new")}>
          {t("faq.addItem")}
        </Button>
      </div>

      <ItemsSection category={category} onCategoryChange={setCategory} onOpen={setItem} />

      {item !== null && (
        <ItemEditor
          key={item === "new" ? "new" : item.id}
          item={item === "new" ? null : item}
          defaultCategory={category}
          onClose={() => setItem(null)}
        />
      )}
    </>
  );
}
