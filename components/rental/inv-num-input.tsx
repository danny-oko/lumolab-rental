"use client";

import { useEffect, useState } from "react";

type InvNumInputProps = {
  value: number;
  onChange: (value: number) => void;
  className?: string;
  min?: number;
};

export function InvNumInput({
  value,
  onChange,
  className = "",
  min = 0,
}: InvNumInputProps) {
  const [draft, setDraft] = useState(String(value));
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    if (!focused) setDraft(String(value));
  }, [value, focused]);

  function commit(raw: string) {
    const n = raw === "" ? min : parseInt(raw, 10);
    const next = Number.isNaN(n) ? min : Math.max(min, n);
    setDraft(String(next));
    if (next !== value) onChange(next);
  }

  return (
    <input
      type="text"
      inputMode="numeric"
      autoComplete="off"
      className={`inv-num-input ${className}`.trim()}
      value={focused ? draft : String(value)}
      onFocus={(e) => {
        setFocused(true);
        setDraft(String(value));
        e.currentTarget.select();
      }}
      onChange={(e) => {
        const digits = e.target.value.replace(/\D/g, "");
        setDraft(digits);
      }}
      onBlur={() => {
        setFocused(false);
        commit(draft);
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.currentTarget.blur();
        }
      }}
    />
  );
}
