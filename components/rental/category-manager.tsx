"use client";

import { CategoryAddPanel } from "@/components/rental/category-add-panel";
import { InvIconInput } from "@/components/rental/inv-icon-input";
import { useDragReorder } from "@/components/rental/use-drag-reorder";
import {
  normalizeCategoryName,
  type CategoryDef,
  type NewCategoryInput,
} from "@/lib/rental/categories";
import type { InventoryItem } from "@/lib/rental/types";
import { useEffect, useMemo, useState } from "react";

type CategoryDraft = {
  emoji: string;
  name: string;
};

type CategoryManagerProps = {
  categories: CategoryDef[];
  inv: InventoryItem[];
  busy: boolean;
  onUpdateCategory: (
    oldName: string,
    patch: { name?: string; emoji?: string },
  ) => Promise<void>;
  onAddCategory: (def: NewCategoryInput) => void | Promise<void>;
  onReorder: (categories: CategoryDef[]) => void | Promise<void>;
  onAlert: (message: string) => void | Promise<void>;
  onClose: () => void;
};

function draftsFromCategories(categories: CategoryDef[]): Record<string, CategoryDraft> {
  return Object.fromEntries(
    categories.map((c) => [c.name, { emoji: c.emoji, name: c.name }]),
  );
}

function draftChanged(original: CategoryDef, draft: CategoryDraft): boolean {
  return (
    normalizeCategoryName(draft.name) !== original.name ||
    draft.emoji !== original.emoji
  );
}

export function CategoryManager({
  categories,
  inv,
  busy,
  onUpdateCategory,
  onAddCategory,
  onReorder,
  onAlert,
  onClose,
}: CategoryManagerProps) {
  const [drafts, setDrafts] = useState<Record<string, CategoryDraft>>(() =>
    draftsFromCategories(categories),
  );
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setDrafts(draftsFromCategories(categories));
  }, [categories]);

  const changed = useMemo(
    () =>
      categories.filter((c) => {
        const draft = drafts[c.name];
        return draft && draftChanged(c, draft);
      }),
    [categories, drafts],
  );

  const { getDragProps } = useDragReorder({
    items: categories,
    getKey: (c) => c.name,
    onReorder: (next) => onReorder(next),
    disabled: busy || saving,
  });

  function setDraft(key: string, patch: Partial<CategoryDraft>) {
    setDrafts((current) => ({
      ...current,
      [key]: { ...current[key], ...patch },
    }));
  }

  async function handleSaveAll() {
    const toSave = categories
      .map((original) => ({ original, draft: drafts[original.name] }))
      .filter(
        (entry): entry is { original: CategoryDef; draft: CategoryDraft } =>
          !!entry.draft && draftChanged(entry.original, entry.draft),
      );
    if (toSave.length === 0) return;
    setSaving(true);
    try {
      for (const { original, draft } of toSave) {
        const name = normalizeCategoryName(draft.name);
        if (!name) {
          await onAlert("Төрлийн нэрийг оруулна уу.");
          return;
        }
        await onUpdateCategory(original.name, {
          name: name !== original.name ? name : undefined,
          emoji: draft.emoji !== original.emoji ? draft.emoji : undefined,
        });
      }
    } catch (err) {
      await onAlert(err instanceof Error ? err.message : String(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="cat-manager">
      <div className="cat-manager__head">
        <div>
          <strong>Төрлүүд засах</strong>
          <div className="panel-sub">
            Нэр, дүрс өөрчлөхөд бүх бараанд автоматаар хэрэгжинэ
          </div>
        </div>
        <div className="cat-manager__head-actions">
          <button
            type="button"
            className="btn sm"
            disabled={busy || saving || changed.length === 0}
            onClick={() => void handleSaveAll()}
          >
            {saving ? "Хадгалж байна…" : "Хадгалах"}
          </button>
          <button
            type="button"
            className="btn sm ghost"
            disabled={saving}
            onClick={onClose}
          >
            Хаах
          </button>
        </div>
      </div>

      <div className="cat-manager__list">
        {categories.map((c) => {
          const draft = drafts[c.name] ?? { emoji: c.emoji, name: c.name };
          const count = inv.filter((i) => i.cat === c.name).length;
          const isDirty = draftChanged(c, draft);

          return (
            <div
              key={c.name}
              className={[
                "cat-manager__row",
                "cat-manager__row--draggable",
                isDirty ? "cat-manager__row--dirty" : "",
              ]
                .filter(Boolean)
                .join(" ")}
              {...getDragProps(c)}
            >
              <span className="drag-handle" title="Чирж эрэмбэлэх" aria-hidden>
                ⋮⋮
              </span>
              <InvIconInput
                value={draft.emoji}
                onChange={(emoji) => setDraft(c.name, { emoji })}
              />
              <input
                type="text"
                className="cat-manager__name"
                value={draft.name}
                disabled={busy || saving}
                onChange={(e) => setDraft(c.name, { name: e.target.value })}
              />
              <span className="cat-manager__count">{count} бараа</span>
            </div>
          );
        })}
      </div>

      <CategoryAddPanel
        embedded
        className="cat-manager__add"
        title="Шинэ төрөл нэмэх"
        onAdd={onAddCategory}
        onCancel={() => {}}
        onError={(message) => void onAlert(message)}
      />
    </div>
  );
}
