import { createIcon } from "./createIcon";

/** Text editor toolbar and lists. */

export const BoldIcon = createIcon(
  "BoldIcon",
  <path d="M7 4h6.5a3.5 3.5 0 0 1 0 7H7zM7 11h7.5a4 4 0 0 1 0 8H7z" />,
);

export const ItalicIcon = createIcon("ItalicIcon", <path d="M10 4h8M6 20h8M15 4l-4 16" />);

export const UnderlineIcon = createIcon(
  "UnderlineIcon",
  <>
    <path d="M7 4v6.5a5 5 0 0 0 10 0V4" />
    <path d="M5 20.5h14" />
  </>,
);

export const ListIcon = createIcon(
  "ListIcon",
  <>
    <path d="M4 6h3M4 12h3M4 18h3M10 6h10M10 12h10M10 18h10" />
  </>,
);

export const ListOrderedIcon = createIcon(
  "ListOrderedIcon",
  <>
    <path d="M11 6h9M11 12h9M11 18h9" />
    <g strokeWidth={1.5}>
      <path d="M4.5 5.2L6 4v4.2" />
      <path d="M4.4 11a1.5 1.5 0 1 1 2.6 1L4.5 14.3h2.8" />
      <path d="M4.4 16.4h2.7l-1.5 1.8a1.5 1.5 0 1 1-1.3 2.3" />
    </g>
  </>,
);
