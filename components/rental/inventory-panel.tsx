"use client";

import { CategoryFilter } from "@/components/rental/category-filter";
import { CatIcon } from "@/components/rental/icons";
import { InvFlagSelect } from "@/components/rental/inv-flag-select";
import { InvNumInput } from "@/components/rental/inv-num-input";
import { InventoryAddForm } from "@/components/rental/inventory-add-form";
import { ItemNameCell } from "@/components/rental/item-name-cell";
import type { InventorySyncState } from "@/components/rental/use-rental-app";
import type { AlertOptions } from "@/components/rental/use-alert-dialog";
import { CATS } from "@/lib/rental/constants";
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
  onAddItem: (item: Omit<InventoryItem, "id">) => Promise<unknown>;
  onDeleteItem: (id: number) => void;
  onAlert: (opts: AlertOptions | string) => Promise<void>;
  itemOutQty: (id: number) => number;
};

function flagLabel(mode: InvFlagMode) {
  return INV_FLAG_OPTIONS.find((o) => o.value === mode)?.label ?? "—";
}

export function InventoryPanel({
  inv,
  filteredInv,
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
  onDeleteItem,
  onAlert,
  itemOutQty,
}: InventoryPanelProps) {
  const [showAdd, setShowAdd] = useState(false);
  const saving = invSaveState === "saving";

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
            className="btn sm"
            onClick={() => setShowAdd((v) => !v)}
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
          onAdd={async (item) => {
            await onAddItem(item);
            setShowAdd(false);
          }}
          onCancel={() => setShowAdd(false)}
        />
      )}

      <CategoryFilter
        catFilter={catFilter}
        inv={inv}
        showCounts
        onFilterChange={onFilterChange}
      />

      <div className="table-wrap">
        <table className="tbl-fixed table-inv">
          <thead>
            <tr>
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

              return (
                <tr key={i.id} className={invEditing ? "inv-row--editing" : undefined}>
                  <td className="col-inv-name">
                    {invEditing ? (
                      <div className="inv-name-edit">
                        <span className="inv-name-edit__icon">
                          <CatIcon cat={i.cat} size={22} />
                        </span>
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
                      <select
                        className="input-cat"
                        value={i.cat}
                        onChange={(e) =>
                          onEditStock(i.id, "cat", e.target.value as Category)
                        }
                      >
                        {CATS.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span className="inv-view-text">{i.cat}</span>
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
        Ray гэрэл (660C/360C/120C) түрээслэхэд стенд автоматаар ₮0-р дагалдана.
        Ace25C, Halo 60x, B7C Bulb-д стенд дагалдахгүй. Combo stand нь тусдаа
        бүтээгдэхүүн бөгөөд үнэгүй дагалдахгүй.
      </p>
    </div>
  );
}
