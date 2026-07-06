"use client";

import { pickCategoryIcon } from "@/lib/rental/categories";

type InvIconInputProps = {
  value: string;
  onChange: (icon: string) => void;
};

export function InvIconInput({ value, onChange }: InvIconInputProps) {
  return (
    <input
      type="text"
      className="inv-icon-input"
      value={value}
      placeholder="📦"
      maxLength={8}
      aria-label="Дүрс"
      onChange={(e) => onChange(pickCategoryIcon(e.target.value) || value)}
    />
  );
}

export function ItemEmoji({
  icon,
  size = 26,
}: {
  icon: string;
  size?: number;
}) {
  return (
    <span
      className="item-emoji"
      style={{ fontSize: Math.round(size * 0.85) }}
      aria-hidden
    >
      {icon || "📦"}
    </span>
  );
}
