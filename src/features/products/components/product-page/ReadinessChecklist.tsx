import { CheckCircleIcon, CloseCircleIcon, ChevronDownIcon } from "@/shared/icons";
import { useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { getLanguage } from "@/shared/i18n";
import { clsx } from "@/shared/lib/clsx";
import { useAttributesQuery } from "../../hooks/queries";
import { formatAttributeValue, hasValue } from "../../lib/characteristics";
import type { ReadinessCheck } from "../../lib/readiness";
import type { ProductDetail } from "../../model/types";
import type { ProductFormValues } from "./form";

interface Props {
  product: ProductDetail;
  values: Partial<ProductFormValues> | undefined;
  checks: ReadinessCheck[];
}

function Mark({ done }: { done: boolean }) {
  return done ? (
    <CheckCircleIcon className="text-green-600" />
  ) : (
    <CloseCircleIcon className="text-red-600" />
  );
}

function DetailRow({ done, label, value }: { done: boolean; label: string; value?: ReactNode }) {
  return (
    <li className="flex items-start gap-2 text-xs">
      <span className="mt-0.5">
        <Mark done={done} />
      </span>
      <span className={clsx("min-w-0", done ? "text-slate-700" : "text-red-600")}>
        {label}
        {done && value ? <span className="text-slate-500">: {value}</span> : null}
      </span>
    </li>
  );
}

/** Row of the checklist that opens a list of what exactly is filled in and what is missing. */
function Expandable({
  done,
  title,
  summary,
  children,
}: {
  done: boolean;
  title: string;
  summary?: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <li>
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className={clsx(
          "flex w-full cursor-pointer items-center gap-2 border-0 bg-transparent p-0 text-left text-sm",
          done ? "text-slate-700" : "font-semibold text-red-600",
        )}
      >
        <Mark done={done} />
        <span>{title}</span>
        {summary && <span className="text-xs font-normal text-slate-500">{summary}</span>}
        <ChevronDownIcon
          className={clsx(
            "ml-auto text-xs text-slate-400 transition-transform",
            open && "rotate-180",
          )}
        />
      </button>
      {open && <ul className="m-0 mt-2 mb-1 list-none space-y-1.5 pl-6">{children}</ul>}
    </li>
  );
}

/**
 * "Tayyorlik" checklist. Characteristics and catalog open up to show which attributes /
 * fields are filled in and which are still empty.
 */
export function ReadinessChecklist({ product, values, checks }: Props) {
  const { t, i18n } = useTranslation();
  const lang = getLanguage(i18n.language).code;
  const categoryId = values?.categoryId === undefined ? product.category?.id : values.categoryId;
  const attributes = useAttributesQuery(categoryId);
  const rows = (values?.attributeValues ?? product.attributeValues).filter(hasValue);

  const attributeRows = (attributes.data ?? []).map((attribute) => ({
    attribute,
    row: rows.find((row) => row.attribute.id === attribute.id),
  }));
  const filledAttributes = attributeRows.filter(({ row }) => row).length;

  const brandId = values?.brandId === undefined ? product.brand?.id : values.brandId;
  const badgeId = values?.badgeId === undefined ? product.badge?.id : values.badgeId;
  const sameAs = (id: number | null | undefined, saved: { id: number } | null) =>
    id && saved?.id === id;
  const catalog = [
    {
      key: "category",
      label: t("products.fields.category"),
      done: !!categoryId,
      value: sameAs(categoryId, product.category) ? product.category?.path : undefined,
    },
    {
      key: "brand",
      label: t("products.fields.brand"),
      done: !!brandId,
      value: sameAs(brandId, product.brand) ? product.brand?.name : undefined,
    },
    {
      key: "badge",
      label: t("products.fields.badge"),
      done: !!badgeId,
      value: sameAs(badgeId, product.badge) ? product.badge?.name : undefined,
    },
  ];

  return (
    <ul className="m-0 mb-4 list-none space-y-2 p-0">
      {checks
        .filter((check) => check.key !== "category" && check.key !== "brand")
        .map((check) =>
          check.key === "characteristics" ? (
            <Expandable
              key={check.key}
              done={check.done}
              title={t(`products.readiness.${check.key}`)}
              summary={
                attributeRows.length ? `${filledAttributes} / ${attributeRows.length}` : undefined
              }
            >
              {!categoryId ? (
                <li className="text-xs text-slate-500">{t("products.modal.charNoCategory")}</li>
              ) : attributeRows.length === 0 ? (
                <li className="text-xs text-slate-500">{t("products.modal.noAttributes")}</li>
              ) : (
                attributeRows.map(({ attribute, row }) => (
                  <DetailRow
                    key={attribute.id}
                    done={!!row}
                    label={attribute.name}
                    value={row ? formatAttributeValue(row, lang) : undefined}
                  />
                ))
              )}
            </Expandable>
          ) : (
            <li
              key={check.key}
              className={clsx(
                "flex items-center gap-2 text-sm",
                check.done ? "text-slate-700" : "font-semibold text-red-600",
              )}
            >
              <Mark done={check.done} />
              {t(`products.readiness.${check.key}`)}
            </li>
          ),
        )}

      <Expandable
        done={!!categoryId && !!brandId}
        title={t("products.modal.catalog")}
        summary={`${catalog.filter((item) => item.done).length} / ${catalog.length}`}
      >
        {catalog.map((item) => (
          <DetailRow key={item.key} done={item.done} label={item.label} value={item.value} />
        ))}
      </Expandable>
    </ul>
  );
}
