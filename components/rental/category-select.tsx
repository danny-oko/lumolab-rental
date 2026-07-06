"use client";

import { CategoryAddPanel } from "@/components/rental/category-add-panel";
import { useCategories } from "@/components/rental/category-context";
import {
  formatCategoryDisplay,
  type NewCategoryInput,
} from "@/lib/rental/categories";
import { useEffect, useState } from "react";

type CategorySelectProps = {
  value: string;
  onChange: (value: string) => void;
  onAddCategory: (def: NewCategoryInput) => void | Promise<void>;
  onError?: (message: string) => void;
  className?: string;
  compact?: boolean;
  /** Parent renders the add panel (e.g. full-width below form row). */
  externalAddPanel?: boolean;
  addOpen?: boolean;
  onAddOpenChange?: (open: boolean) => void;
};

export function CategorySelect({
  value,
  onChange,
  onAddCategory,
  onError,
  className = "",
  compact = false,
  externalAddPanel = false,
  addOpen: addOpenProp,
  onAddOpenChange,
}: CategorySelectProps) {
  const categories = useCategories();
  const [addOpenInternal, setAddOpenInternal] = useState(false);
  const addOpen = addOpenProp ?? addOpenInternal;
  const setAddOpen = onAddOpenChange ?? setAddOpenInternal;

  useEffect(() => {
    if (externalAddPanel && !addOpenProp) setAddOpenInternal(false);
  }, [externalAddPanel, addOpenProp]);

  async function handleAdd(def: NewCategoryInput) {
    await onAddCategory(def);
    onChange(def.name);
    setAddOpen(false);
  }

  return (
    <>
      <div className={`cat-select${compact ? " cat-select--compact" : ""}`}>
        <select
          className={["cat-select__input", className].filter(Boolean).join(" ")}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        >
          {categories.map((c) => (
            <option key={c.name} value={c.name}>
              {formatCategoryDisplay(c)}
            </option>
          ))}
        </select>
        <button
          type="button"
          className={
            "cat-select__add-btn" + (addOpen ? " is-active" : "")
          }
          title="Шинэ төрөл нэмэх"
          aria-label="Шинэ төрөл нэмэх"
          aria-expanded={addOpen}
          onClick={() => setAddOpen(!addOpen)}
        >
          +
        </button>
      </div>

      {addOpen && !externalAddPanel && (
        <div
          className="cat-select__overlay"
          onClick={() => setAddOpen(false)}
          role="presentation"
        >
          <div
            className="cat-select__overlay-panel"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-label="Шинэ төрөл нэмэх"
          >
            <CategoryAddPanel
              onAdd={handleAdd}
              onCancel={() => setAddOpen(false)}
              onError={onError}
            />
          </div>
        </div>
      )}
    </>
  );
}
