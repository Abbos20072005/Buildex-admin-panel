import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import type { Plugin } from "vite";
import { tailwindColors } from "../src/theme/colors.ts";
import { fonts } from "../src/theme/fonts.ts";

const OUTPUT = fileURLToPath(new URL("../src/theme/tokens.css", import.meta.url));

function buildCss(): string {
  const colors = Object.entries(tailwindColors).map(([name, value]) => `  --color-${name}: ${value};`);
  return [
    "/* GENERATED from src/theme/colors.ts and fonts.ts by vite/theme-tokens.ts — do not edit. */",
    "@theme {",
    `  --font-sans: ${fonts.sans};`,
    `  --font-mono: ${fonts.mono};`,
    "",
    ...colors,
    "}",
    "",
  ].join("\n");
}

/**
 * Writes the Tailwind theme (src/theme/tokens.css) from the TS theme files,
 * so brand colours are defined once and reach both Ant Design and Tailwind.
 * Runs when the Vite config loads — restart `npm run dev` after editing colors.ts.
 */
export function themeTokens(): Plugin {
  const css = buildCss();
  if (!existsSync(OUTPUT) || readFileSync(OUTPUT, "utf8") !== css) writeFileSync(OUTPUT, css);
  return { name: "buildex-theme-tokens" };
}
