import { Card } from "antd";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";

/** Card with a bold title, an optional link / info on the right and the content below. */
export function WidgetCard({
  title,
  extra,
  className,
  children,
}: {
  title: ReactNode;
  extra?: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Card
      title={<span className="text-base font-bold">{title}</span>}
      extra={extra}
      className={className}
    >
      {children}
    </Card>
  );
}

/** "Barchasi" style link in a card header. */
export function CardLink({ to, children }: { to: string; children: ReactNode }) {
  return (
    <Link to={to} className="text-sm font-semibold">
      {children}
    </Link>
  );
}
