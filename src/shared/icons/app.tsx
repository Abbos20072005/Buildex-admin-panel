import { Dot } from "./Dot";
import { createIcon } from "./createIcon";

/** Sections of the admin: sidebar, header, cards. */

export const AppsIcon = createIcon(
  "AppsIcon",
  <>
    <rect x="3.5" y="3.5" width="7" height="7" rx="2" />
    <rect x="13.5" y="3.5" width="7" height="7" rx="2" />
    <rect x="3.5" y="13.5" width="7" height="7" rx="2" />
    <rect x="13.5" y="13.5" width="7" height="7" rx="2" />
  </>,
);

export const ChartIcon = createIcon(
  "ChartIcon",
  <>
    <rect x="4" y="11" width="4" height="9" rx="1.2" />
    <rect x="10" y="4" width="4" height="16" rx="1.2" />
    <rect x="16" y="8" width="4" height="12" rx="1.2" />
  </>,
);

export const GaugeIcon = createIcon(
  "GaugeIcon",
  <>
    <path d="M3.5 16a8.5 8.5 0 1 1 17 0" />
    <path d="M12 16l3.6-5" />
    <circle cx="12" cy="16" r="1.3" />
    <path d="M7 20.5h10" />
  </>,
);

export const BoxIcon = createIcon(
  "BoxIcon",
  <>
    <path d="M12 3l8 4.5v9L12 21l-8-4.5v-9z" />
    <path d="M4.2 7.6L12 12l7.8-4.4" />
    <path d="M12 12v9" />
  </>,
);

export const CartIcon = createIcon(
  "CartIcon",
  <>
    <path d="M3 4h2.4l2 10.4a1.5 1.5 0 0 0 1.5 1.2h8.2a1.5 1.5 0 0 0 1.5-1.1L20 8H6.2" />
    <circle cx="9.5" cy="19.5" r="1.3" />
    <circle cx="17" cy="19.5" r="1.3" />
  </>,
);

export const FileIcon = createIcon(
  "FileIcon",
  <>
    <path d="M14 3H7.5A2.5 2.5 0 0 0 5 5.5v13A2.5 2.5 0 0 0 7.5 21h9a2.5 2.5 0 0 0 2.5-2.5V8z" />
    <path d="M14 3v3.5A1.5 1.5 0 0 0 15.5 8H19" />
    <path d="M8.5 12.5h7M8.5 16.5H13" />
  </>,
);

export const FileSearchIcon = createIcon(
  "FileSearchIcon",
  <>
    <path d="M14 3H7.5A2.5 2.5 0 0 0 5 5.5v13A2.5 2.5 0 0 0 7.5 21H11" />
    <path d="M14 3l5 5v2.5" />
    <path d="M14 3v3.5A1.5 1.5 0 0 0 15.5 8H19" />
    <circle cx="16" cy="16.5" r="3" />
    <path d="M18.2 18.7L21 21.5" />
  </>,
);

export const BellIcon = createIcon(
  "BellIcon",
  <>
    <path d="M6 10a6 6 0 1 1 12 0c0 5 1.5 6.5 2 7H4c.5-.5 2-2 2-7z" />
    <path d="M10 20.5a2.2 2.2 0 0 0 4 0" />
  </>,
);

export const MegaphoneIcon = createIcon(
  "MegaphoneIcon",
  <>
    <path d="M4 9.5v5h3l8.5 4.5V5L7 9.5z" />
    <path d="M18.8 9a4.5 4.5 0 0 1 0 6" />
  </>,
);

export const CommentIcon = createIcon(
  "CommentIcon",
  <path d="M4 6.5A2.5 2.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5v8a2.5 2.5 0 0 1-2.5 2.5H12l-4 3.5V17H6.5A2.5 2.5 0 0 1 4 14.5z" />,
);

export const TagIcon = createIcon(
  "TagIcon",
  <>
    <path d="M3.5 12.2V5.5a2 2 0 0 1 2-2h6.7a2 2 0 0 1 1.4.6l7 7a2 2 0 0 1 0 2.8l-6.7 6.7a2 2 0 0 1-2.8 0l-7-7a2 2 0 0 1-.6-1.4z" />
    <circle cx="8.5" cy="8.5" r="1.2" />
  </>,
);

export const GlobeIcon = createIcon(
  "GlobeIcon",
  <>
    <circle cx="12" cy="12" r="9" />
    <ellipse cx="12" cy="12" rx="4" ry="9" />
    <path d="M3 12h18" />
  </>,
);

export const UserIcon = createIcon(
  "UserIcon",
  <>
    <circle cx="12" cy="8" r="4" />
    <path d="M4.5 20.5c0-3.9 3.4-6.5 7.5-6.5s7.5 2.6 7.5 6.5" />
  </>,
);

export const UsersIcon = createIcon(
  "UsersIcon",
  <>
    <circle cx="9" cy="8" r="3.5" />
    <path d="M2.5 19.5c0-3.4 2.9-5.5 6.5-5.5s6.5 2.1 6.5 5.5" />
    <path d="M15.6 4.9a3.5 3.5 0 0 1 0 6.2" />
    <path d="M17.6 14.3c2.3.5 3.9 2.2 3.9 5.2" />
  </>,
);

export const UserCheckIcon = createIcon(
  "UserCheckIcon",
  <>
    <circle cx="10" cy="8" r="3.8" />
    <path d="M3.5 20.5c0-3.6 2.9-6.2 6.5-6.2 1 0 2 .2 2.8.6" />
    <path d="M15.5 17.5l2 2 3.7-4" />
  </>,
);

export const UserRemoveIcon = createIcon(
  "UserRemoveIcon",
  <>
    <circle cx="10" cy="8" r="3.8" />
    <path d="M3.5 20.5c0-3.6 2.9-6.2 6.5-6.2 1.3 0 2.5.3 3.5.9" />
    <path d="M16.2 14.7l4.6 4.6M20.8 14.7l-4.6 4.6" />
  </>,
);

export const WalletIcon = createIcon(
  "WalletIcon",
  <>
    <path d="M3.5 8A2.5 2.5 0 0 1 6 5.5h12A2.5 2.5 0 0 1 20.5 8v9a2.5 2.5 0 0 1-2.5 2.5H6A2.5 2.5 0 0 1 3.5 17z" />
    <path d="M3.8 8.6L15 4.4a1.5 1.5 0 0 1 2 1.4v.2" />
    <path d="M20.5 11.5h-4a2 2 0 0 0 0 4h4" />
    <Dot x={16.6} y={13.5} r={0.9} />
  </>,
);

export const DollarIcon = createIcon(
  "DollarIcon",
  <>
    <circle cx="12" cy="12" r="9" />
    <path d="M14.6 9.3c-.4-1-1.4-1.7-2.7-1.7-1.6 0-2.8.9-2.8 2.1 0 3 5.8 1.4 5.8 4.4 0 1.2-1.2 2.1-2.9 2.1-1.4 0-2.5-.7-2.9-1.8" />
    <path d="M12 5.8v1.8M12 16.5v1.7" />
  </>,
);

export const ClockIcon = createIcon(
  "ClockIcon",
  <>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3.5 2" />
  </>,
);

export const CalendarIcon = createIcon(
  "CalendarIcon",
  <>
    <rect x="3.5" y="5" width="17" height="15.5" rx="2.5" />
    <path d="M3.5 10h17M8 3v4M16 3v4" />
  </>,
);

export const InboxIcon = createIcon(
  "InboxIcon",
  <>
    <path d="M3.5 13.5l2.7-8A2 2 0 0 1 8.1 4h7.8a2 2 0 0 1 1.9 1.5l2.7 8" />
    <path d="M3.5 13.5V18a2 2 0 0 0 2 2h13a2 2 0 0 0 2-2v-4.5" />
    <path d="M3.5 13.5h5l1 2.5h5l1-2.5h5" />
  </>,
);

export const ImageIcon = createIcon(
  "ImageIcon",
  <>
    <rect x="3.5" y="4.5" width="17" height="15" rx="2.5" />
    <circle cx="9" cy="10" r="1.6" />
    <path d="M4 17.5l4.8-4.8a1.5 1.5 0 0 1 2.1 0L16 17.8M14 15.7l1.5-1.5a1.5 1.5 0 0 1 2.1 0l2.9 2.9" />
  </>,
);

export const PlayCircleIcon = createIcon(
  "PlayCircleIcon",
  <>
    <circle cx="12" cy="12" r="9" />
    <path d="M10.2 8.7v6.6a.6.6 0 0 0 .9.5l5.2-3.3a.6.6 0 0 0 0-1l-5.2-3.3a.6.6 0 0 0-.9.5z" />
  </>,
);

export const RocketIcon = createIcon(
  "RocketIcon",
  <>
    <path d="M12 3c3.4 1.6 5.6 5 5.6 9.3L15.2 15H8.8l-2.4-2.7C6.4 8 8.6 4.6 12 3z" />
    <circle cx="12" cy="9.5" r="1.7" />
    <path d="M6.6 12.6L4 15.8l3.7-.6M17.4 12.6l2.6 3.2-3.7-.6M10 18l2 3 2-3" />
  </>,
);

export const StarIcon = createIcon(
  "StarIcon",
  <path d="M12 3.3l2.6 5.4 5.9.8-4.3 4.1 1 5.9-5.2-2.8-5.2 2.8 1-5.9-4.3-4.1 5.9-.8z" />,
  { filled: true },
);
