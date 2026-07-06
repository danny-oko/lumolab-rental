"use client";

import { pickCategoryIcon } from "@/lib/rental/categories";
import { useEffect, useRef, useState } from "react";

type InvIconInputProps = {
  value: string;
  onChange: (icon: string) => void;
};

export function InvIconInput({ value, onChange }: InvIconInputProps) {
  const [draft, setDraft] = useState(value);
  const [focused, setFocused] = useState(false);
  const composingRef = useRef(false);

  useEffect(() => {
    if (!focused) setDraft(value);
  }, [value, focused]);

  function commit(raw: string) {
    const next = pickCategoryIcon(raw) || "📦";
    setDraft(next);
    if (next !== value) onChange(next);
  }

  return (
    <input
      type="text"
      className="inv-icon-input"
      value={focused ? draft : value}
      placeholder="📦"
      maxLength={8}
      aria-label="Дүрс"
      title="Дүрс оруулах"
      autoComplete="off"
      autoCorrect="off"
      spellCheck={false}
      onFocus={(e) => {
        setFocused(true);
        setDraft(value);
        requestAnimationFrame(() => e.currentTarget.select());
      }}
      onCompositionStart={() => {
        composingRef.current = true;
      }}
      onCompositionEnd={(e) => {
        composingRef.current = false;
        setDraft(e.currentTarget.value);
      }}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={() => {
        setFocused(false);
        commit(draft);
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter") e.currentTarget.blur();
      }}
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
