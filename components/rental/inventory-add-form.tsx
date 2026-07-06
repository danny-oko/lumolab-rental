"use client";

import { useState } from "react";
import { CategorySelect } from "@/components/rental/category-select";
import { CategoryAddPanel } from "@/components/rental/category-add-panel";
import { InvFlagSelect } from "@/components/rental/inv-flag-select";
import { InvNumInput } from "@/components/rental/inv-num-input";
import { InvIconInput } from "@/components/rental/inv-icon-input";
import type { AlertOptions } from "@/components/rental/use-alert-dialog";
import type { CategoryDef, NewCategoryInput } from "@/lib/rental/categories";
import {
  flagModeToItemFlags,
  type InvFlagMode,
} from "@/lib/rental/inv-flags";
import type { InventoryItem } from "@/lib/rental/types";

export type NewInventoryInput = Omit<InventoryItem, "id" | "sortOrder">;

const emptyItem = (): NewInventoryInput => ({
  name: "",
  cat: "ГЭРЭЛ",
  icon: "💡",
  qty: 1,
  price: 0,
});

type InventoryAddFormProps = {
  busy: boolean;
  onAlert: (opts: AlertOptions | string) => Promise<void>;
  onAdd: (item: NewInventoryInput) => Promise<void>;
  onAddCategory: (def: NewCategoryInput) => void | Promise<void>;
  onCancel: () => void;
};

export function InventoryAddForm({
  busy,
  onAlert,
  onAdd,
  onAddCategory,
  onCancel,
}: InventoryAddFormProps) {
  const [draft, setDraft] = useState<NewInventoryInput>(emptyItem);
  const [flagMode, setFlagMode] = useState<InvFlagMode>("");
  const [categoryAddOpen, setCategoryAddOpen] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!draft.name.trim()) {
      void onAlert("Барааны нэрийг оруулна уу.");
      return;
    }
    await onAdd({
      ...draft,
      name: draft.name.trim(),
      ...flagModeToItemFlags(flagMode),
    });
    setDraft(emptyItem());
    setFlagMode("");
    setCategoryAddOpen(false);
  }

  return (
    <form className="inv-add-form" onSubmit={(e) => void handleSubmit(e)}>
      <div className="inv-add-form__grid">
        <label className="inv-add-form__field inv-add-form__field--icon">
          <span>Дүрс</span>
          <InvIconInput
            value={draft.icon}
            onChange={(icon) => setDraft((d) => ({ ...d, icon }))}
          />
        </label>
        <label className="inv-add-form__field inv-add-form__field--name">
          <span>Нэр</span>
          <input
            type="text"
            value={draft.name}
            placeholder="Жишээ: Amaran Ray 660C"
            onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
            autoFocus
          />
        </label>
        <div className="inv-add-form__field inv-add-form__field--cat">
          <span>Төрөл</span>
          <CategorySelect
            value={draft.cat}
            onChange={(cat) => setDraft((d) => ({ ...d, cat }))}
            onAddCategory={onAddCategory}
            onError={(message) => void onAlert(message)}
            externalAddPanel
            addOpen={categoryAddOpen}
            onAddOpenChange={setCategoryAddOpen}
          />
        </div>
        <label className="inv-add-form__field">
          <span>Нийт</span>
          <InvNumInput
            min={0}
            value={draft.qty}
            onChange={(qty) => setDraft((d) => ({ ...d, qty }))}
          />
        </label>
        <label className="inv-add-form__field">
          <span>Үнэ (12ц)</span>
          <InvNumInput
            min={0}
            value={draft.price}
            onChange={(price) => setDraft((d) => ({ ...d, price }))}
          />
        </label>
        <label className="inv-add-form__field">
          <span>Тэмдэглэл</span>
          <InvFlagSelect value={flagMode} onChange={setFlagMode} />
        </label>
      </div>

      {categoryAddOpen && (
        <CategoryAddPanel
          className="inv-add-form__cat-panel"
          embedded
          onAdd={async (def) => {
            await onAddCategory(def);
            setDraft((d) => ({ ...d, cat: def.name }));
            setCategoryAddOpen(false);
          }}
          onCancel={() => setCategoryAddOpen(false)}
          onError={(message) => void onAlert(message)}
        />
      )}

      <div className="inv-add-form__actions">
        <button type="submit" className="btn sm" disabled={busy}>
          {busy ? "Хадгалж байна…" : "Нэмэх"}
        </button>
        <button
          type="button"
          className="btn sm ghost"
          disabled={busy}
          onClick={onCancel}
        >
          Болих
        </button>
      </div>
    </form>
  );
}
