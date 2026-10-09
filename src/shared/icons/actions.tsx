import { Dot } from "./Dot";
import { createIcon } from "./createIcon";

/** Actions, arrows, status marks and small controls. */

export const PlusIcon = createIcon("PlusIcon", <path d="M12 5v14M5 12h14" />);

export const CloseIcon = createIcon("CloseIcon", <path d="M6 6l12 12M18 6L6 18" />);

export const CheckIcon = createIcon("CheckIcon", <path d="M5 13l4 4L19 7" />);

export const SearchIcon = createIcon(
  "SearchIcon",
  <>
    <circle cx="11" cy="11" r="7" />
    <path d="M20 20l-4.2-4.2" />
  </>,
);

export const FilterIcon = createIcon("FilterIcon", <path d="M3 5h18l-7 8v6l-4 2v-8z" />);

export const EditIcon = createIcon(
  "EditIcon",
  <>
    <path d="M4.5 19.5l1-4.2L16.3 4.5a2 2 0 0 1 2.8 0l.4.4a2 2 0 0 1 0 2.8L8.7 18.5z" />
    <path d="M14.5 6.5l3 3" />
  </>,
);

export const TrashIcon = createIcon(
  "TrashIcon",
  <>
    <path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13" />
  </>,
);

export const SaveIcon = createIcon(
  "SaveIcon",
  <>
    <path d="M5.5 3.5H16L20.5 8v10.5a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2v-13a2 2 0 0 1 2-2z" />
    <path d="M8 3.5v4.2h7V3.5" />
    <path d="M7.5 20.5v-5.5a1 1 0 0 1 1-1h7a1 1 0 0 1 1 1v5.5" />
  </>,
);

export const UndoIcon = createIcon(
  "UndoIcon",
  <>
    <path d="M9 14l-4-4 4-4" />
    <path d="M5 10h10a4 4 0 0 1 0 8h-3" />
  </>,
);

export const SendIcon = createIcon(
  "SendIcon",
  <>
    <path d="M20.5 3.5L10.5 13.5" />
    <path d="M20.5 3.5l-6.5 17-3.5-7-7-3.5z" />
  </>,
);

export const DownloadIcon = createIcon(
  "DownloadIcon",
  <>
    <path d="M12 4v11M7 10l5 5 5-5M5 20h14" />
  </>,
);

export const UploadIcon = createIcon(
  "UploadIcon",
  <>
    <path d="M12 16V5M7.5 9.5 12 5l4.5 4.5" />
    <path d="M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3" />
  </>,
);

export const LogoutIcon = createIcon(
  "LogoutIcon",
  <>
    <path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3" />
    <path d="M10 16l-4-4 4-4M6 12h10" />
  </>,
);

export const LockIcon = createIcon(
  "LockIcon",
  <>
    <rect x="5" y="11" width="14" height="9" rx="2" />
    <path d="M8 11V8a4 4 0 0 1 8 0v3" />
  </>,
);

export const MenuIcon = createIcon("MenuIcon", <path d="M3 6h18M3 12h18M3 18h18" />);

export const MoreIcon = createIcon(
  "MoreIcon",
  <>
    <circle cx="5.5" cy="12" r="1.5" />
    <circle cx="12" cy="12" r="1.5" />
    <circle cx="18.5" cy="12" r="1.5" />
  </>,
  { filled: true },
);

export const GripIcon = createIcon(
  "GripIcon",
  <>
    <circle cx="9" cy="6" r="1.6" />
    <circle cx="15" cy="6" r="1.6" />
    <circle cx="9" cy="12" r="1.6" />
    <circle cx="15" cy="12" r="1.6" />
    <circle cx="9" cy="18" r="1.6" />
    <circle cx="15" cy="18" r="1.6" />
  </>,
  { filled: true },
);

export const ChevronDownIcon = createIcon("ChevronDownIcon", <path d="M6 9l6 6 6-6" />);
export const ChevronLeftIcon = createIcon("ChevronLeftIcon", <path d="M15 6l-6 6 6 6" />);
export const ChevronRightIcon = createIcon("ChevronRightIcon", <path d="M9 6l6 6-6 6" />);

export const ArrowUpIcon = createIcon("ArrowUpIcon", <path d="M12 19V5M6 11l6-6 6 6" />);
export const ArrowDownIcon = createIcon("ArrowDownIcon", <path d="M12 5v14M6 13l6 6 6-6" />);

export const LoadingIcon = createIcon("LoadingIcon", <path d="M12 3a9 9 0 1 0 9 9" />, {
  spin: true,
});

export const CheckCircleIcon = createIcon(
  "CheckCircleIcon",
  <>
    <circle cx="12" cy="12" r="9" />
    <path d="M8 12.5l2.5 2.5L16 9.5" />
  </>,
);

export const CloseCircleIcon = createIcon(
  "CloseCircleIcon",
  <>
    <circle cx="12" cy="12" r="9" />
    <path d="M9 9l6 6M15 9l-6 6" />
  </>,
);

export const InfoCircleIcon = createIcon(
  "InfoCircleIcon",
  <>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 11v5M12 8v.01" />
  </>,
);

export const QuestionCircleIcon = createIcon(
  "QuestionCircleIcon",
  <>
    <circle cx="12" cy="12" r="9" />
    <path d="M9.6 9.4a2.5 2.5 0 0 1 4.8.9c0 1.7-2.4 2-2.4 3.5" />
    <Dot x={12} y={17.2} />
  </>,
);

export const ExclamationIcon = createIcon(
  "ExclamationIcon",
  <>
    <path d="M12 4.5v10" />
    <Dot x={12} y={19.2} r={1.25} />
  </>,
);
