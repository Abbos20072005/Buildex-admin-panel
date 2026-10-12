import { MinusIcon, PlusIcon } from "@/shared/icons";
import { App, Button, Card, Switch } from "antd";
import { useTranslation } from "react-i18next";
import { getErrorMessage } from "@/shared/api";
import { useSaveRules } from "../hooks/queries";
import type { HomePageState, HomeRulesInput } from "../model/types";

const MAX_MIN_PRODUCTS = 50;

/** "Ko'rsatish qoidalari": rules that hide products or a whole block from the page. */
export function RulesCard({ page }: { page: HomePageState | undefined }) {
  const { t } = useTranslation();
  const { message } = App.useApp();
  const save = useSaveRules();

  const apply = (rules: HomeRulesInput) =>
    save.mutate(rules, { onError: (error) => message.error(getErrorMessage(error)) });

  const minProducts = page?.minProducts ?? 0;

  return (
    <Card title={<span className="text-base font-bold">{t("home.rules.title")}</span>}>
      <div className="space-y-5">
        <label className="flex items-center justify-between gap-4">
          <span>
            <span className="block font-medium">{t("home.rules.hideOutOfStock")}</span>
            <span className="block text-xs text-slate-500">
              {t("home.rules.hideOutOfStockHint")}
            </span>
          </span>
          <Switch
            checked={page?.hideOutOfStock ?? false}
            disabled={!page || save.isPending}
            onChange={(hideOutOfStock) => apply({ hideOutOfStock })}
          />
        </label>

        <label className="flex items-center justify-between gap-4">
          <span>
            <span className="block font-medium">{t("home.rules.hideStalePrice")}</span>
            <span className="block text-xs text-slate-500">
              {t("home.rules.hideStalePriceHint")}
            </span>
          </span>
          <Switch
            checked={page?.hideStalePrice ?? false}
            disabled={!page || save.isPending}
            onChange={(hideStalePrice) => apply({ hideStalePrice })}
          />
        </label>

        <div className="flex items-center justify-between gap-4">
          <span>
            <span className="block font-medium">{t("home.rules.minProducts")}</span>
            <span className="block text-xs text-slate-500">{t("home.rules.minProductsHint")}</span>
          </span>
          <span className="flex items-center rounded-xl border border-slate-200">
            <Button
              type="text"
              icon={<MinusIcon />}
              disabled={!page || save.isPending || minProducts <= 0}
              aria-label="−"
              onClick={() => apply({ minProducts: minProducts - 1 })}
            />
            <span className="w-10 text-center font-semibold tabular-nums">{minProducts}</span>
            <Button
              type="text"
              icon={<PlusIcon />}
              disabled={!page || save.isPending || minProducts >= MAX_MIN_PRODUCTS}
              aria-label="+"
              onClick={() => apply({ minProducts: minProducts + 1 })}
            />
          </span>
        </div>
      </div>
    </Card>
  );
}
