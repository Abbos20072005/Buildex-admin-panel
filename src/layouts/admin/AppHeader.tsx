import { BellIcon, MenuIcon } from "@/shared/icons";
import { Button, Layout } from "antd";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "@/shared/ui";
import { GlobalSearch } from "./GlobalSearch";
import { UserMenu } from "./UserMenu";

export function AppHeader({ onMenuClick }: { onMenuClick: () => void }) {
  const { t } = useTranslation();

  return (
    <Layout.Header className="sticky top-0 z-40 flex items-center gap-3 border-b border-slate-200 leading-none">
      <Button
        type="text"
        icon={<MenuIcon />}
        onClick={onMenuClick}
        className="lg:hidden"
        aria-label="Menu"
      />
      <GlobalSearch />
      <div className="ml-auto flex items-center gap-2">
        <LanguageSwitcher compact />
        <Button
          icon={<BellIcon />}
          aria-label={t("common.notifications")}
          className="hidden sm:inline-flex"
        />
        <UserMenu />
      </div>
    </Layout.Header>
  );
}
