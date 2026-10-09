import AntIcon from "@ant-design/icons";
import type { GetProps } from "antd";
import type { ReactNode, SVGProps } from "react";

export type IconProps = Omit<GetProps<typeof AntIcon>, "component" | "children">;

interface Options {
  /** solid glyph (stars, dots) instead of an outline */
  filled?: boolean;
  /** rotate all the time (spinners) */
  spin?: boolean;
}

/**
 * Buildex icon set: every icon is drawn on a 24×24 grid with the same 1.75 stroke, round caps and
 * joins, and keeps a 3.5 px margin — so they all weigh the same next to each other. They are
 * wrapped in the Ant Design `Icon`, so size (font-size), colour (currentColor) and `spin` work
 * as they did with `@ant-design/icons`.
 */
export function createIcon(name: string, glyph: ReactNode, { filled, spin }: Options = {}) {
  const Svg = (props: SVGProps<SVGSVGElement>) => (
    // the Ant Design `Icon` passes fill="currentColor" — our own attributes must win over it
    <svg
      {...props}
      viewBox="0 0 24 24"
      width="1em"
      height="1em"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={filled ? 1.25 : 1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      focusable="false"
      aria-hidden="true"
    >
      {glyph}
    </svg>
  );

  const Icon = (props: IconProps) => <AntIcon component={Svg} spin={spin} {...props} />;
  Icon.displayName = name;
  return Icon;
}
