import { DownOutlined, LogoutOutlined } from "@ant-design/icons";
import { Avatar, Button, Dropdown } from "antd";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/features/auth";

function initials(name: string) {
  return name
    .replace(/[^\p{L}\s]/gu, "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join("");
}

export function UserMenu() {
  const { t } = useTranslation();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  return (
    <Dropdown
      trigger={["click"]}
      placement="bottomRight"
      menu={{
        items: [
          {
            key: "profile",
            disabled: true,
            label: (
              <div className="py-1">
                <div className="font-semibold text-slate-900">{user.name}</div>
                <div className="text-xs text-slate-500">
                  {user.username} · {user.isSuperuser ? t("common.superadmin") : t("common.admin")}
                </div>
              </div>
            ),
          },
          { type: "divider" },
          { key: "logout", danger: true, icon: <LogoutOutlined />, label: t("common.logout") },
        ],
        onClick: ({ key }) => {
          if (key !== "logout") return;
          signOut();
          navigate("/login", { replace: true });
        },
      }}
    >
      <Button shape="round" className="h-10 ps-1 pe-3 font-semibold">
        <Avatar size={30} className="bg-brand text-xs font-bold">
          {initials(user.name)}
        </Avatar>
        <span className="hidden max-w-36 truncate sm:inline">{user.name}</span>
        <DownOutlined className="text-[10px]" />
      </Button>
    </Dropdown>
  );
}
