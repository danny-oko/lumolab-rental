"use client";

import {
  FALLBACK_EMOJI,
  normalizeCategoryName,
  pickCategoryIcon,
  type NewCategoryInput,
} from "@/lib/rental/categories";
import { useState } from "react";

type CategoryAddPanelProps = {
  onAdd: (def: NewCategoryInput) => void | Promise<void>;
  onCancel: () => void;
  onError?: (message: string) => void;
  className?: string;
  title?: string;
  embedded?: boolean;
};

export function CategoryAddPanel({
  onAdd,
  onCancel,
  onError,
  className = "",
  title = "Шинэ төрөл нэмэх",
  embedded = false,
}: CategoryAddPanelProps) {
  const [newName, setNewName] = useState("");
  const [newIcon, setNewIcon] = useState("");

  async function handleAdd() {
    const name = normalizeCategoryName(newName);
    const emoji = pickCategoryIcon(newIcon) || FALLBACK_EMOJI;
    if (!name) {
      onError?.("Төрлийн нэрийг оруулна уу.");
      return;
    }
    if (!pickCategoryIcon(newIcon)) {
      onError?.("Дүрс оруулна уу.");
      return;
    }
    try {
      await onAdd({ name, emoji });
      setNewName("");
      setNewIcon("");
    } catch (err) {
      onError?.(err instanceof Error ? err.message : String(err));
    }
  }

  return (
    <div
      className={[
        "cat-add-panel",
        embedded ? "cat-add-panel--embedded" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {!embedded && (
        <div className="cat-add-panel__head">
          <strong className="cat-add-panel__title">{title}</strong>
          <button
            type="button"
            className="cat-add-panel__close"
            aria-label="Хаах"
            onClick={onCancel}
          >
            ×
          </button>
        </div>
      )}

      <div className="cat-add-panel__body">
        <label className="cat-add-panel__name">
          <span>Төрлийн нэр</span>
          <input
            type="text"
            value={newName}
            placeholder="Жишээ: КАМЕР"
            autoFocus
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                void handleAdd();
              }
            }}
          />
        </label>

        <label className="cat-add-panel__icon">
          <span>Дүрс</span>
          <input
            type="text"
            className="cat-add-panel__icon-input"
            value={newIcon}
            placeholder="💡"
            maxLength={8}
            onChange={(e) => setNewIcon(pickCategoryIcon(e.target.value))}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                void handleAdd();
              }
            }}
          />
        </label>

        <div className="cat-add-panel__actions">
          <button type="button" className="btn sm" onClick={() => void handleAdd()}>
            Нэмэх
          </button>
          <button type="button" className="btn sm ghost" onClick={onCancel}>
            Болих
          </button>
        </div>
      </div>
    </div>
  );
}
