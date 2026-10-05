import { SearchIcon } from "@/shared/icons";
import { Input, type InputRef } from "antd";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useDebouncedValue } from "@/shared/lib/useDebouncedValue";
import { useHotkey } from "@/shared/lib/useHotkey";

/** Pages whose lists are filtered by the header search (?q=…) → placeholder i18n key. */
const SEARCHABLE_PAGES: Record<string, string> = {
  "/orders": "common.searchPlaceholder",
  "/products": "products.searchPlaceholder",
};
const FALLBACK_PAGE = "/orders";

/**
 * Header search. On a searchable page (orders, products) it filters that list live
 * (?q=…, debounced); on any other page Enter opens the orders page with the query.
 */
export function GlobalSearch() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [params, setParams] = useSearchParams();
  const inputRef = useRef<InputRef>(null);

  const onSearchablePage = pathname in SEARCHABLE_PAGES;
  const urlQuery = onSearchablePage ? (params.get("q") ?? "") : "";
  const [value, setValue] = useState(urlQuery);
  const debounced = useDebouncedValue(value, 350);

  // keep the input in sync when the URL changes from elsewhere (back button, another page…)
  useEffect(() => setValue(urlQuery), [urlQuery]);

  const writeQuery = useCallback(
    (query: string) => {
      setParams(
        (current) => {
          const next = new URLSearchParams(current);
          if (query.trim()) next.set("q", query.trim());
          else next.delete("q");
          next.delete("page");
          return next;
        },
        { replace: true },
      );
    },
    [setParams],
  );

  useEffect(() => {
    if (onSearchablePage && debounced.trim() !== urlQuery) writeQuery(debounced);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced]);

  useHotkey(
    "/",
    useCallback(() => inputRef.current?.focus(), []),
  );

  const submit = () => {
    if (onSearchablePage) writeQuery(value);
    else
      navigate(
        value.trim() ? `${FALLBACK_PAGE}?q=${encodeURIComponent(value.trim())}` : FALLBACK_PAGE,
      );
  };

  return (
    <Input
      ref={inputRef}
      allowClear
      value={value}
      onChange={(event) => setValue(event.target.value)}
      onPressEnter={submit}
      placeholder={t(SEARCHABLE_PAGES[pathname] ?? SEARCHABLE_PAGES[FALLBACK_PAGE])}
      prefix={<SearchIcon className="text-slate-400" />}
      className="max-w-[480px]"
    />
  );
}
