"use client";

import { useCategories } from "@/components/rental/category-context";
import { getCategoryEmoji } from "@/lib/rental/categories";

export const CatIcon = ({
  cat,
  size = 22,
  className,
}: {
  cat: string;
  size?: number;
  className?: string;
}) => {
  const categories = useCategories();
  const emoji = getCategoryEmoji(cat, categories);

  return (
    <span
      className={["cat-emoji", className].filter(Boolean).join(" ")}
      style={{ fontSize: Math.round(size * 0.9), lineHeight: 1 }}
      aria-hidden
    >
      {emoji}
    </span>
  );
};

export const LumoMark = ({ size = 30 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="currentColor">
    <path d="M22 28 L34 28 L34 64 L22 70 Z" />
    <path d="M42 24 L54 24 L54 52 L42 58 Z" />
    <path d="M62 30 L74 24 L74 50 L62 56 Z" />
    <path d="M34 64 L58 76 L46 82 L22 70 Z" />
    <path d="M54 52 L78 64 L66 70 L42 58 Z" />
  </svg>
);
