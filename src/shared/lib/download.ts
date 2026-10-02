type Cell = string | number | null | undefined;

function escapeCsv(value: Cell): string {
  const text = value == null ? "" : String(value);
  return /[",;\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

/** Downloads rows as a CSV that Excel opens correctly (BOM + ";" separator). */
export function downloadCsv(filename: string, header: string[], rows: Cell[][]) {
  const lines = [header, ...rows].map((row) => row.map(escapeCsv).join(";"));
  const blob = new Blob(["﻿" + lines.join("\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = Object.assign(document.createElement("a"), { href: url, download: filename });
  link.click();
  URL.revokeObjectURL(url);
}
