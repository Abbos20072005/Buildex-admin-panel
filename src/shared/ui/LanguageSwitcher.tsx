import { DownOutlined, GlobalOutlined } from "@ant-design/icons";
import { Button, Dropdown } from "antd";
import { useTranslation } from "react-i18next";
import { getLanguage, LANGUAGES } from "@/shared/i18n";

export function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const { i18n, t } = useTranslation();
  const current = getLanguage(i18n.language);

  return (
    <Dropdown
      trigger={["click"]}
      menu={{
        selectable: true,
        selectedKeys: [current.code],
        items: LANGUAGES.map((language) => ({
          key: language.code,
          label: (
            <span className="flex items-center gap-3">
              <span className="w-6 text-[11px] font-bold text-slate-400">{language.short}</span>
              {language.label}
            </span>
          ),
        })),
        onClick: ({ key }) => void i18n.changeLanguage(key),
      }}
    >
      <Button aria-label={t("common.language")} icon={<GlobalOutlined />} className="font-semibold">
        {compact ? current.short : current.label}
        <DownOutlined className="text-[10px]" />
      </Button>
    </Dropdown>
  );
}
