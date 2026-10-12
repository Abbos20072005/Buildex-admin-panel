import { Skeleton } from "antd";
import { useTranslation } from "react-i18next";
import { clsx } from "@/shared/lib/clsx";
import { formatMoney } from "@/shared/lib/format";
import { usePreviewItems } from "../../hooks/queries";
import type { Device, PreviewBlock, PreviewItem } from "../../model/preview";

const PRODUCT_TYPES = [
  "badge_products",
  "sale_products",
  "new_products",
  "bestsellers",
  "all_products",
];

function Picture({ src, className }: { src: string | null; className?: string }) {
  return src ? (
    <img src={src} alt="" loading="lazy" className={clsx("object-cover", className)} />
  ) : (
    <span className={clsx("block bg-slate-100", className)} />
  );
}

function Slider({ items }: { items: PreviewItem[] }) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      {items.map((item) => (
        <Picture key={item.id} src={item.image} className="h-24 w-72 shrink-0 rounded-lg" />
      ))}
    </div>
  );
}

function Circles({ items }: { items: PreviewItem[] }) {
  return (
    <div className="flex gap-3 overflow-x-auto pb-1">
      {items.map((item) => (
        <div key={item.id} className="w-16 shrink-0 text-center">
          <Picture
            src={item.image}
            className="mx-auto size-12 rounded-full border border-slate-100 object-contain"
          />
          <div className="mt-1 truncate text-[10px] text-slate-600">{item.title}</div>
        </div>
      ))}
    </div>
  );
}

function Pills({ items }: { items: PreviewItem[] }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((item) => (
        <span
          key={item.id}
          className="rounded-full border border-slate-200 px-2.5 py-1 text-[10px] font-medium"
        >
          {item.title}
        </span>
      ))}
    </div>
  );
}

function Products({ items, device }: { items: PreviewItem[]; device: Device }) {
  return (
    <div className={clsx("grid gap-2", device === "desktop" ? "grid-cols-4" : "grid-cols-2")}>
      {items.slice(0, device === "desktop" ? 4 : 4).map((item) => (
        <div key={item.id} className="overflow-hidden rounded-lg border border-slate-100">
          <Picture src={item.image} className="h-20 w-full object-contain" />
          <div className="p-1.5">
            <div className="line-clamp-2 min-h-7 text-[10px] leading-3.5">{item.title}</div>
            {item.price ? (
              <div className="mt-1 text-[11px] font-bold">
                {formatMoney(item.price)}
                {item.oldPrice ? (
                  <span className="ml-1 text-[9px] font-normal text-slate-400 line-through">
                    {formatMoney(item.oldPrice)}
                  </span>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>
      ))}
    </div>
  );
}

function Rows({ items }: { items: PreviewItem[] }) {
  return (
    <ul className="m-0 list-none divide-y divide-slate-100 rounded-lg border border-slate-100 p-0">
      {items.map((item) => (
        <li key={item.id} className="px-2.5 py-1.5 text-[11px]">
          {item.title}
        </li>
      ))}
    </ul>
  );
}

/** One block of the preview: its title, a marker when it is hidden, and what it would show. */
export function PreviewBlockView({ block, device }: { block: PreviewBlock; device: Device }) {
  const { t } = useTranslation();
  // a block that doesn't reach customers is still drawn, dimmed, so the reason is visible
  const local = block.type === "pages";
  const query = usePreviewItems(block, device);
  const items: PreviewItem[] = local
    ? block.pages.map((page, index) => ({
        id: index,
        title: page.titleRu || page.titleUz || page.path,
        image: null,
      }))
    : (query.data ?? []);

  let body;
  if (!local && query.isPending) body = <Skeleton active title={false} paragraph={{ rows: 2 }} />;
  else if (!local && query.isError)
    body = <div className="text-[11px] text-slate-400">{t("home.preview.loadError")}</div>;
  else if (items.length === 0)
    body = <div className="text-[11px] text-slate-400">{t("home.preview.empty")}</div>;
  else if (block.type === "slider" || block.type === "banner") body = <Slider items={items} />;
  else if (block.type === "categories") body = <Circles items={items} />;
  else if (block.type === "brands") body = <Pills items={items} />;
  else if (PRODUCT_TYPES.includes(block.type)) body = <Products items={items} device={device} />;
  else body = <Rows items={items} />;

  return (
    <section
      className={clsx(
        "rounded-xl p-2.5 transition",
        block.active && "bg-brand/5 ring-2 ring-brand",
        block.hidden && "opacity-45",
      )}
    >
      <div className="mb-2 flex items-center gap-2">
        <h4 className="m-0 min-w-0 flex-1 truncate text-xs font-bold">
          {block.title || t("home.preview.untitled")}
        </h4>
        {block.isNew && (
          <span className="rounded bg-brand px-1.5 text-[9px] font-bold text-white">
            {t("home.preview.new")}
          </span>
        )}
        {block.hidden && (
          <span className="shrink-0 rounded bg-slate-200 px-1.5 text-[9px] font-semibold text-slate-600">
            {t(`home.preview.hidden.${block.hidden}`)}
          </span>
        )}
      </div>
      {body}
    </section>
  );
}
