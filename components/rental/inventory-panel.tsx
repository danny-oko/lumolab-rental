"use client";

import {
  CategoryFilter,
  CategoryLabel,
} from "@/components/rental/category-filter";
import { CategoryManager } from "@/components/rental/category-manager";
import { CategorySelect } from "@/components/rental/category-select";
import { InvIconInput } from "@/components/rental/inv-icon-input";
import { InvFlagSelect } from "@/components/rental/inv-flag-select";
import { InvNumInput } from "@/components/rental/inv-num-input";
import { InventoryAddForm } from "@/components/rental/inventory-add-form";
import { ItemNameCell } from "@/components/rental/item-name-cell";
import type { AlertOptions } from "@/components/rental/use-alert-dialog";
import { useDragReorder } from "@/components/rental/use-drag-reorder";
import type { InventorySyncState } from "@/components/rental/use-rental-app";
import type { CategoryDef, NewCategoryInput } from "@/lib/rental/categories";
import {
  getInvFlagMode,
  INV_FLAG_OPTIONS,
  type InvFlagMode,
} from "@/lib/rental/inv-flags";
import type { Category, InventoryItem } from "@/lib/rental/types";
import { useState } from "react";

type InventoryPanelProps = {
  inv: InventoryItem[];
  filteredInv: InventoryItem[];
  categories: CategoryDef[];
  catFilter: Category | "all";
  avail: (id: number) => number;
  busy: boolean;
  invEditing: boolean;
  invHasChanges: boolean;
  invSaveState: InventorySyncState;
  onFilterChange: (filter: Category | "all") => void;
  onStartEditing: () => void;
  onEditStock: (
    id: number,
    field: keyof InventoryItem,
    val: string | number | boolean,
  ) => void;
  onSaveAll: () => void;
  onDiscardAll: () => void;
  onEditFlagMode: (id: number, mode: InvFlagMode) => void;
  onAddItem: (
    item: Omit<InventoryItem, "id" | "sortOrder">,
  ) => Promise<unknown>;
  onAddCategory: (def: NewCategoryInput) => void | Promise<void>;
  onUpdateCategory: (
    oldName: string,
    patch: { name?: string; emoji?: string },
  ) => Promise<void>;
  onDeleteItem: (id: number) => void;
  onReorderInventory?: (items: InventoryItem[]) => void | Promise<void>;
  onReorderCategories?: (categories: CategoryDef[]) => void | Promise<void>;
  onAlert: (opts: AlertOptions | string) => Promise<void>;
  itemOutQty: (id: number) => number;
};

function flagLabel(mode: InvFlagMode) {
  return INV_FLAG_OPTIONS.find((o) => o.value === mode)?.label ?? "—";
}

export function InventoryPanel({
  inv,
  filteredInv,
  categories,
  catFilter,
  avail,
  busy,
  invEditing,
  invHasChanges,
  invSaveState,
  onFilterChange,
  onStartEditing,
  onEditStock,
  onSaveAll,
  onDiscardAll,
  onEditFlagMode,
  onAddItem,
  onAddCategory,
  onUpdateCategory,
  onDeleteItem,
  onReorderInventory,
  onReorderCategories,
  onAlert,
  itemOutQty,
}: InventoryPanelProps) {
  const [showAdd, setShowAdd] = useState(false);
  const [showCatManager, setShowCatManager] = useState(false);
  const saving = invSaveState === "saving";
  const canReorder =
    !invEditing && !busy && !!onReorderInventory && catFilter === "all";

  const { getDragProps } = useDragReorder({
    items: filteredInv,
    getKey: (item) => String(item.id),
    onReorder: (next) => onReorderInventory?.(next),
    disabled: !canReorder,
  });

  return (
    <div className="panel">
      <div className="panel-head panel-head--inv">
        <div>
          <strong>Бараа материал</strong>
          <div className="panel-sub">{inv.length} нэр төрөл</div>
        </div>
        <div className="panel-head__actions">
          {invEditing ? (
            <>
              <button
                type="button"
                className="btn sm ghost"
                onClick={onDiscardAll}
                disabled={saving || busy}
              >
                Цуцлах
              </button>
              <button
                type="button"
                className="btn sm inv-save-all-btn"
                onClick={() => onSaveAll()}
                disabled={saving || busy || !invHasChanges}
              >
                {saving
                  ? "Хадгалж байна…"
                  : invSaveState === "saved"
                    ? "Хадгалагдсан ✓"
                    : "Хадгалах"}
              </button>
            </>
          ) : (
            <button
              type="button"
              className="btn sm ghost"
              onClick={onStartEditing}
              disabled={busy}
            >
              Засах
            </button>
          )}
          <button
            type="button"
            className="btn sm ghost"
            onClick={() => {
              setShowCatManager((v) => !v);
              if (!showCatManager) setShowAdd(false);
            }}
            disabled={invEditing || busy}
          >
            {showCatManager ? "Хаах" : "Төрөл засах"}
          </button>
          <button
            type="button"
            className="btn sm"
            onClick={() => {
              setShowAdd((v) => !v);
              if (!showAdd) setShowCatManager(false);
            }}
            disabled={invEditing}
          >
            {showAdd ? "Хаах" : "+ Шинэ бараа"}
          </button>
        </div>
      </div>

      {showAdd && (
        <InventoryAddForm
          busy={busy}
          onAlert={onAlert}
          onAddCategory={onAddCategory}
          onAdd={async (item) => {
            await onAddItem(item);
            setShowAdd(false);
          }}
          onCancel={() => setShowAdd(false)}
        />
      )}

      {showCatManager && (
        <CategoryManager
          categories={categories}
          inv={inv}
          busy={busy}
          onUpdateCategory={onUpdateCategory}
          onAddCategory={onAddCategory}
          onReorder={(cats) => onReorderCategories?.(cats)}
          onAlert={(message) => onAlert(message)}
          onClose={() => setShowCatManager(false)}
        />
      )}

      <CategoryFilter
        catFilter={catFilter}
        inv={inv}
        showCounts
        reorderable={!invEditing && !busy && !showCatManager}
        onFilterChange={onFilterChange}
        onReorder={onReorderCategories}
      />

      <div className="table-wrap">
        <table
          className={[
            "tbl-fixed table-inv",
            invEditing ? "table-inv--editing" : "",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          <thead>
            <tr>
              {canReorder && (
                <th className="col-inv-drag" aria-label="Эрэмбэ" />
              )}
              <th className="col-inv-name">Нэр</th>
              <th className="col-inv-cat col-cat">Төрөл</th>
              <th className="col-inv-flag">Тэмдэглэл</th>
              <th className="col-inv-qty num col-center">Нийт</th>
              <th className="col-inv-avail num col-center">Бэлэн</th>
              <th className="col-inv-price num col-center">Үнэ (12ц)</th>
              <th className="col-inv-status">Төлөв</th>
              {invEditing && <th className="col-inv-actions"></th>}
            </tr>
          </thead>
          <tbody>
            {filteredInv.map((i) => {
              const a = avail(i.id);
              const flagMode = getInvFlagMode(i);
              const outQty = itemOutQty(i.id);
              const canDelete = outQty === 0;
              const dragProps = canReorder ? getDragProps(i) : {};

              return (
                <tr
                  key={i.id}
                  className={
                    [
                      invEditing ? "inv-row--editing" : "",
                      canReorder ? "inv-row--draggable" : "",
                    ]
                      .filter(Boolean)
                      .join(" ") || undefined
                  }
                  {...dragProps}
                >
                  {canReorder && (
                    <td className="col-inv-drag">
                      <span
                        className="drag-handle"
                        title="Чирж эрэмбэлэх"
                        aria-hidden
                      >
                        ⋮⋮
                      </span>
                    </td>
                  )}
                  <td className="col-inv-name">
                    {invEditing ? (
                      <div className="inv-name-edit">
                        <InvIconInput
                          value={i.icon}
                          onChange={(icon) => onEditStock(i.id, "icon", icon)}
                        />
                        <div className="inv-name-edit__body">
                          <input
                            type="text"
                            className="inv-name-input"
                            value={i.name}
                            onChange={(e) =>
                              onEditStock(i.id, "name", e.target.value)
                            }
                          />
                        </div>
                      </div>
                    ) : (
                      <ItemNameCell item={i} variant="inventory" />
                    )}
                  </td>
                  <td className="col-inv-cat col-cat">
                    {invEditing ? (
                      <CategorySelect
                        compact
                        className="input-cat"
                        value={i.cat}
                        onChange={(cat) => onEditStock(i.id, "cat", cat)}
                        onAddCategory={onAddCategory}
                        onError={(message) => void onAlert(message)}
                      />
                    ) : (
                      <span className="inv-view-text">
                        <CategoryLabel name={i.cat} />
                      </span>
                    )}
                  </td>
                  <td className="col-inv-flag">
                    {invEditing ? (
                      <InvFlagSelect
                        value={flagMode}
                        onChange={(mode) => onEditFlagMode(i.id, mode)}
                      />
                    ) : (
                      <span className="inv-view-text inv-view-text--muted">
                        {flagLabel(flagMode)}
                      </span>
                    )}
                  </td>
                  <td className="col-inv-qty num col-center">
                    {invEditing ? (
                      <InvNumInput
                        className="input-sm"
                        min={0}
                        value={i.qty}
                        onChange={(v) => onEditStock(i.id, "qty", v)}
                      />
                    ) : (
                      <span className="inv-view-text">{i.qty}</span>
                    )}
                  </td>
                  <td className="col-inv-avail num col-center">
                    <span className={a > 0 ? "ok" : "danger"}>{a}</span>
                  </td>
                  <td className="col-inv-price num col-center">
                    {invEditing ? (
                      <InvNumInput
                        className="input-md"
                        min={0}
                        value={i.price}
                        onChange={(v) => onEditStock(i.id, "price", v)}
                      />
                    ) : (
                      <span className="inv-view-text">
                        {i.price.toLocaleString("en-US")}
                      </span>
                    )}
                  </td>
                  <td className="col-inv-status">
                    {a <= 0 ? (
                      <span className="chip out">Дууссан</span>
                    ) : i.qty === a ? (
                      <span className="chip in">Бэлэн</span>
                    ) : (
                      <span className="chip zero">
                        {a}/{i.qty}
                      </span>
                    )}
                  </td>
                  {invEditing && (
                    <td className="col-inv-actions">
                      <button
                        type="button"
                        className="btn sm danger ghost"
                        disabled={busy || saving || !canDelete}
                        title={
                          canDelete
                            ? "Устгах"
                            : `Идэвхтэй түрээст ${outQty} ширхэг`
                        }
                        onClick={() => onDeleteItem(i.id)}
                      >
                        Устгах
                      </button>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="hr" />
      <p className="panel-note">
        {canReorder
          ? "Жагсаалтын дарааллыг чирж өөрчилнө — хадгалалт шууд бааз руу синк хийгдэнэ. "
          : catFilter !== "all"
            ? "Бүх төрлийг сонгосон үед л дарааллыг чирж өөрчилнө. "
            : null}
        Ray гэрэл (660C/360C/120C) түрээслэхэд стенд автоматаар ₮0-р дагалдана.
        Ace25C, Halo 60x, B7C Bulb-д стенд дагалдахгүй. Combo stand нь тусдаа
        бүтээгдэхүүн бөгөөд үнэгүй дагалдахгүй.
      </p>
    </div>
  );
}
