import type { Category } from "@/lib/rental/types";
import type { ReactNode } from "react";

const Ico = ({ d, size = 22 }: { d: ReactNode; size?: number }) => (
  <svg
    width={size}
    height={size * 0.8}
    viewBox="0 0 120 100"
    fill="none"
    stroke="currentColor"
    strokeWidth="4"
    strokeLinejoin="round"
    strokeLinecap="round"
    style={{ flexShrink: 0 }}
  >
    {d}
  </svg>
);

const ICON_PATHS: Record<Category, ReactNode> = {
  ГЭРЭЛ: (
    <g>
      <path d="M10 30 L58 30 L58 62 L20 62 L10 52 Z" />
      <path
        d="M30 30 L30 24 M36 30 L36 24 M42 30 L42 24 M48 30 L48 24"
        strokeWidth="2.4"
      />
      <circle cx="30" cy="46" r="7" />
      <path d="M30 46 L20 56" strokeWidth="5" />
      <path d="M58 36 L66 38 L66 54 L58 56" />
      <path d="M66 38 Q72 30 88 28 L110 22 L110 70 L88 64 Q72 62 66 54" />
      <path d="M92 30 L92 62 M100 27 L100 65" strokeWidth="2.4" />
      <path d="M22 62 Q20 78 30 84 L30 94" strokeWidth="5" />
      <rect x="27" y="92" width="6" height="6" strokeWidth="3" />
    </g>
  ),
  FIXTURE: (
    <g>
      <rect x="14" y="36" width="40" height="32" rx="3" />
      <path
        d="M22 36 L22 68 M30 36 L30 68 M38 36 L38 68 M46 36 L46 68"
        strokeWidth="2.4"
      />
      <rect x="54" y="30" width="10" height="44" rx="2" />
      <path d="M64 38 L98 26 L98 42 L64 46 Z" />
      <path d="M64 56 L98 74 L98 58 L64 54 Z" />
    </g>
  ),
  СТЕНД: (
    <g>
      <path d="M60 8 L60 18" strokeWidth="5" />
      <rect x="54" y="18" width="12" height="10" rx="2" />
      <rect x="54" y="28" width="12" height="9" rx="2" />
      <path d="M60 37 L60 78" strokeWidth="6" />
      <circle cx="60" cy="58" r="5" />
      <path d="M60 60 L20 90 M60 60 L100 90 M60 62 L60 88" />
      <ellipse cx="18" cy="91" rx="7" ry="3.5" />
      <ellipse cx="102" cy="91" rx="7" ry="3.5" />
      <ellipse cx="60" cy="90" rx="6" ry="3" />
    </g>
  ),
  БАТТЕРЭЙ: (
    <g>
      <rect x="16" y="34" width="88" height="50" rx="5" />
      <path d="M34 34 Q34 18 60 18 Q86 18 86 34" strokeWidth="5" />
      <circle cx="34" cy="58" r="7" />
      <rect x="48" y="50" width="28" height="18" rx="2" />
      <circle cx="90" cy="56" r="8" />
      <path d="M50 76 L74 76" strokeWidth="2.4" />
    </g>
  ),
  БУСАД: (
    <g>
      <path d="M20 32 L60 14 L100 32 L100 72 L60 90 L20 72 Z" />
      <path d="M20 32 L60 50 L100 32 M60 50 L60 90" strokeWidth="3" />
    </g>
  ),
};

const CAT_ICON_CLASS: Record<Category, string> = {
  ГЭРЭЛ: "cat-icon--gerel",
  FIXTURE: "cat-icon--fixture",
  СТЕНД: "cat-icon--stand",
  БАТТЕРЭЙ: "cat-icon--battery",
  БУСАД: "cat-icon--other",
};

export const CatIcon = ({
  cat,
  size = 22,
  className,
}: {
  cat: Category;
  size?: number;
  className?: string;
}) => (
  <span
    className={["cat-icon", CAT_ICON_CLASS[cat], className]
      .filter(Boolean)
      .join(" ")}
  >
    <Ico size={size} d={ICON_PATHS[cat] || ICON_PATHS["БУСАД"]} />
  </span>
);

export const LumoMark = ({ size = 30 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="currentColor">
    <path d="M22 28 L34 28 L34 64 L22 70 Z" />
    <path d="M42 24 L54 24 L54 52 L42 58 Z" />
    <path d="M62 30 L74 24 L74 50 L62 56 Z" />
    <path d="M34 64 L58 76 L46 82 L22 70 Z" />
    <path d="M54 52 L78 64 L66 70 L42 58 Z" />
  </svg>
);
