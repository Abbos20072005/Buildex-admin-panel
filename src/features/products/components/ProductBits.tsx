import { LockIcon, ImageIcon } from "@/shared/icons";
import { Tag, Tooltip } from "antd";
import { useTranslation } from "react-i18next";
import { clsx } from "@/shared/lib/clsx";
import { formatNumber } from "@/shared/lib/format";
import { PUBLISH_STATUS_COLOR } from "../model/constants";
import type { Product, PublishStatus } from "../model/types";

export function PublishStatusTag({ status }: { status: PublishStatus }) {
  const { t } = useTranslation();
  return (
    <Tag color={PUBLISH_STATUS_COLOR[status]} variant="filled" className="m-0 font-semibold">
      {t(`publishStatus.${status}`)}
    </Tag>
  );
}

/** "1C" marker on values that come from 1C and can't be edited here. */
export function ErpMark({ className }: { className?: string }) {
  const { t } = useTranslation();
  return (
    <Tooltip title={t("products.erpHint")}>
      <span
        className={clsx(
          "inline-flex items-center gap-0.5 rounded border border-slate-200 bg-slate-50 px-1 text-[11px] leading-4 font-semibold text-slate-500",
          className,
        )}
      >
        <LockIcon className="text-[10px]" />
        1C
      </span>
    </Tooltip>
  );
}

/** Product photo or a placeholder. */
export function ProductThumb({
  src,
  alt,
  className,
}: {
  src: string | null;
  alt: string;
  className?: string;
}) {
  return (
    <span
      className={clsx(
        "grid shrink-0 place-items-center overflow-hidden rounded-lg border border-slate-200 bg-slate-50 text-slate-300",
        className,
      )}
    >
      {src ? (
        <img src={src} alt={alt} loading="lazy" className="size-full object-contain" />
      ) : (
        <ImageIcon className="text-xl" />
      )}
    </span>
  );
}

/** Selling price; the old price is crossed out when there is a discount. */
export function ProductPrice({ product }: { product: Pick<Product, "price" | "discountPrice"> }) {
  const discounted = product.discountPrice != null && product.discountPrice < product.price;
  return (
    <span className="inline-flex flex-col items-end leading-tight tabular-nums">
      <span className="font-semibold">
        {formatNumber(discounted ? (product.discountPrice as number) : product.price)}
      </span>
      {discounted && (
        <span className="text-xs text-slate-400 line-through">{formatNumber(product.price)}</span>
      )}
    </span>
  );
}

/** Stock; zero is red. */
export function ProductStock({ product }: { product: Pick<Product, "quantity" | "unit"> }) {
  const { t } = useTranslation();
  return (
    <span className={clsx("font-semibold tabular-nums", product.quantity <= 0 && "text-red-600")}>
      {formatNumber(product.quantity)}{" "}
      <span className="text-xs font-normal text-slate-400">{t(`unit.${product.unit}`)}</span>
    </span>
  );
}
