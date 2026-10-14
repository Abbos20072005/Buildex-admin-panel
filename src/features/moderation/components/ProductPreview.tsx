import { ImageIcon } from "@/shared/icons";
import DOMPurify from "dompurify";
import { useTranslation } from "react-i18next";
import { clsx } from "@/shared/lib/clsx";
import { formatNumber } from "@/shared/lib/format";
import type { Localized, PreviewProduct } from "../model/types";

export type PreviewSurface = "site" | "app";
export type PreviewLang = keyof Localized;

interface Props {
  product: PreviewProduct;
  surface: PreviewSurface;
  lang: PreviewLang;
}

function Price({ product }: { product: PreviewProduct }) {
  const { t } = useTranslation();
  if (product.price === null) return null;
  const discounted = product.discountPrice !== null && product.discountPrice < product.price;
  const current = discounted ? (product.discountPrice as number) : product.price;
  return (
    <div className="flex items-baseline gap-2">
      <span className="text-xl font-extrabold tabular-nums">
        {formatNumber(current)} {t("common.sum")}
      </span>
      {discounted && (
        <span className="text-xs text-slate-400 tabular-nums line-through">
          {formatNumber(product.price)}
        </span>
      )}
    </div>
  );
}

function Stock({ product }: { product: PreviewProduct }) {
  const { t } = useTranslation();
  if (product.quantity === null) return null;
  const unit = product.unit ? t(`unit.${product.unit}`, { defaultValue: product.unit }) : "";
  return (
    <div
      className={clsx(
        "text-xs font-semibold",
        product.quantity > 0 ? "text-green-700" : "text-red-600",
      )}
    >
      {product.quantity > 0
        ? t("moderation.preview.inStock", { count: formatNumber(product.quantity), unit })
        : t("moderation.preview.outOfStock")}
    </div>
  );
}

function Photo({ src, className }: { src: string | null; className?: string }) {
  return (
    <span
      className={clsx(
        "grid shrink-0 place-items-center overflow-hidden rounded-lg bg-slate-100 text-2xl text-slate-300",
        className,
      )}
    >
      {src ? <img src={src} alt="" className="size-full object-contain" /> : <ImageIcon />}
    </span>
  );
}

/** How the product card will look on the site (browser frame) or in the app (phone width). */
export function ProductPreview({ product, surface, lang }: Props) {
  const { t } = useTranslation();
  const name = product.names[lang] || product.name;
  const description = DOMPurify.sanitize(product.descriptions[lang]);
  const photo = product.images[0] ?? product.image;
  const slug = (product.articulCode ?? String(product.id)).toLowerCase();
  const attributes = product.attributes.filter((item) => item.name[lang] && item.value[lang]);

  const body = (
    <>
      <div className={clsx("flex gap-4", surface === "app" && "flex-col")}>
        <Photo src={photo} className={surface === "app" ? "aspect-square w-full" : "size-28"} />
        <div className="min-w-0 space-y-1.5">
          {product.brand && <div className="text-xs text-slate-500">{product.brand}</div>}
          <div className="text-base leading-snug font-bold">
            {name || <span className="text-red-600">{t("moderation.preview.noName")}</span>}
          </div>
          <Price product={product} />
          <Stock product={product} />
        </div>
      </div>

      <div className="mt-3 text-sm">
        {description.replace(/<[^>]*>/g, "").trim() ? (
          <div className="rich-content" dangerouslySetInnerHTML={{ __html: description }} />
        ) : (
          <div className="text-red-600">{t("moderation.preview.noDescription")}</div>
        )}
      </div>

      {attributes.length > 0 && (
        <dl className="mt-3 divide-y divide-slate-100 text-xs">
          {attributes.map((item, index) => (
            <div key={index} className="flex justify-between gap-3 py-1.5">
              <dt className="text-slate-500">{item.name[lang]}</dt>
              <dd className="m-0 text-right font-semibold">
                {item.value[lang]} {item.unit[lang]}
              </dd>
            </div>
          ))}
        </dl>
      )}
    </>
  );

  if (surface === "app") {
    return (
      <div className="mx-auto flex h-[520px] w-[272px] flex-col overflow-hidden rounded-[2.25rem] border-[7px] border-slate-800 bg-white shadow-lg">
        {/* status bar with the notch */}
        <div className="relative flex h-7 shrink-0 items-center justify-center">
          <span className="h-4 w-20 rounded-full bg-slate-800" />
        </div>
        <div className="min-h-0 flex-1 [scrollbar-width:none] overflow-y-auto px-3 pb-3 [&::-webkit-scrollbar]:hidden">
          {body}
        </div>
        <div className="shrink-0 border-t border-slate-200 p-3">
          <span className="block rounded-lg bg-brand py-2 text-center text-sm font-bold text-white">
            {t("moderation.preview.addToCart")}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
      <div className="flex items-center gap-2 border-b border-slate-200 bg-surface-alt px-3 py-2">
        <span className="flex gap-1">
          <i className="size-2 rounded-full bg-slate-300" />
          <i className="size-2 rounded-full bg-slate-300" />
          <i className="size-2 rounded-full bg-slate-300" />
        </span>
        <span className="truncate font-mono text-xs text-slate-500">
          buildex.uz/{lang}/p/{slug}
        </span>
      </div>
      <div className="max-h-80 overflow-auto p-4">
        {product.categoryPath.length > 0 && (
          <div className="mb-3 text-xs text-slate-500">{product.categoryPath.join(" / ")}</div>
        )}
        {body}
      </div>
    </div>
  );
}
