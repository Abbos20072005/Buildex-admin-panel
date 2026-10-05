import { Dot } from "./Dot";
import { createIcon } from "./createIcon";

/** Actions, arrows, status marks and small controls. */

export const PlusIcon = createIcon("PlusIcon", <path d="M12 5v14M5 12h14" />);

export const CloseIcon = createIcon("CloseIcon", <path d="M6 6l12 12M18 6L6 18" />);

export const CheckIcon = createIcon("CheckIcon", <path d="M5 12.5l5 5L19 7" />);

export const SearchIcon = createIcon(
  "SearchIcon",
  <>
    <circle cx="11" cy="11" r="6.5" />
    <path d="M16 16l4.5 4.5" />
  </>,
);

export const FilterIcon = createIcon(
  "FilterIcon",
  <path d="M4 5.5h16l-6.2 7.6V19l-3.6 1.6v-7.5z" />,
);

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
    <path d="M4 7h16M9.5 7V4.5h5V7" />
    <path d="M6.5 7l.8 12a1.5 1.5 0 0 0 1.5 1.4h6.4a1.5 1.5 0 0 0 1.5-1.4L17.5 7" />
    <path d="M10 11v5M14 11v5" />
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
    <path d="M9 14L4 9l5-5" />
    <path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11" />
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
    <path d="M12 4v11" />
    <path d="M7.5 10.5L12 15l4.5-4.5" />
    <path d="M5 19.5h14" />
  </>,
);

export const UploadIcon = createIcon(
  "UploadIcon",
  <>
    <path d="M12 15.5v-11" />
    <path d="M7.5 9L12 4.5 16.5 9" />
    <path d="M5 19.5h14" />
  </>,
);

export const LogoutIcon = createIcon(
  "LogoutIcon",
  <>
    <path d="M10 4H6.5A2.5 2.5 0 0 0 4 6.5v11A2.5 2.5 0 0 0 6.5 20H10" />
    <path d="M15 8l4 4-4 4" />
    <path d="M19 12H9.5" />
  </>,
);

export const LockIcon = createIcon(
  "LockIcon",
  <>
    <rect x="5" y="10.5" width="14" height="10" rx="2.5" />
    <path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" />
    <path d="M12 14.8v2.2" />
  </>,
);

export const MenuIcon = createIcon("MenuIcon", <path d="M4 7h16M4 12h16M4 17h16" />);

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
    <circle cx="9" cy="6" r="1.3" />
    <circle cx="15" cy="6" r="1.3" />
    <circle cx="9" cy="12" r="1.3" />
    <circle cx="15" cy="12" r="1.3" />
    <circle cx="9" cy="18" r="1.3" />
    <circle cx="15" cy="18" r="1.3" />
  </>,
  { filled: true },
);

export const ChevronDownIcon = createIcon("ChevronDownIcon", <path d="M6 9.5l6 6 6-6" />);
export const ChevronLeftIcon = createIcon("ChevronLeftIcon", <path d="M14.5 6l-6 6 6 6" />);
export const ChevronRightIcon = createIcon("ChevronRightIcon", <path d="M9.5 6l6 6-6 6" />);

export const ArrowUpIcon = createIcon("ArrowUpIcon", <path d="M12 19V5M6 11l6-6 6 6" />);
export const ArrowDownIcon = createIcon("ArrowDownIcon", <path d="M12 5v14M6 13l6 6 6-6" />);

export const LoadingIcon = createIcon("LoadingIcon", <path d="M12 3a9 9 0 1 0 9 9" />, {
  spin: true,
});

export const CheckCircleIcon = createIcon(
  "CheckCircleIcon",
  <>
    <circle cx="12" cy="12" r="9" />
    <path d="M8 12.5l3 3 5.5-6.5" />
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
    <path d="M12 11v5.5" />
    <Dot x={12} y={7.9} />
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
