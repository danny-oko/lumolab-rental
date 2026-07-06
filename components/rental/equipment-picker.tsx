import { CategoryFilter, CategoryLabel } from "@/components/rental/category-filter";
import { ItemNameCell } from "@/components/rental/item-name-cell";
import { QtyStepper } from "@/components/rental/qty-stepper";
import { fmt } from "@/lib/rental/constants";
import type { Category, InventoryItem } from "@/lib/rental/types";

type EquipmentPickerProps = {
  inv: InventoryItem[];
  filteredInv: InventoryItem[];
  cart: Record<number, number>;
  catFilter: Category | "all";
  durMult: number;
  avail: (id: number) => number;
  onFilterChange: (filter: Category | "all") => void;
  onSetQty: (id: number, qty: number) => void;
};

export function EquipmentPicker({
  inv,
  filteredInv,
  cart,
  catFilter,
  durMult,
  avail,
  onFilterChange,
  onSetQty,
}: EquipmentPickerProps) {
  const selectedCount = Object.values(cart).filter((q) => q > 0).length;

  return (
    <div className="rental-pane rental-picker panel">
      <div className="panel-head">
        <strong>Тоног төхөөрөмж сонгох</strong>
        <div className="rental-picker__meta">
          {selectedCount > 0 && (
            <span className="rental-picker__count">{selectedCount} сонгосон</span>
          )}
          <span className="muted small">
            Тоо оруулж захиалгад нэмнэ
          </span>
        </div>
      </div>

      <CategoryFilter
        catFilter={catFilter}
        inv={inv}
        onFilterChange={onFilterChange}
      />

      <div className="table-wrap">
        <table className="table-rent">
          <colgroup>
            <col className="col-name" />
            <col className="col-type" />
            <col className="col-avail" />
            <col className="col-price" />
            <col className="col-qty" />
            <col className="col-sum" />
          </colgroup>
          <thead>
            <tr>
              <th>Нэр</th>
              <th className="col-type">Төрөл</th>
              <th className="num">Бэлэн</th>
              <th className="num">Нэгж үнэ</th>
              <th className="num">Тоо</th>
              <th className="num">Дүн</th>
            </tr>
          </thead>
          <tbody>
            {filteredInv.map((i) => {
              const a = avail(i.id);
              const q = cart[i.id] || 0;
              return (
                <tr key={i.id} className={q > 0 ? "is-selected" : undefined}>
                  <td>
                    <ItemNameCell item={i} variant="rental" />
                  </td>
                  <td className="small muted col-type">
                    <CategoryLabel name={i.cat} />
                  </td>
                  <td className="num">
                    <span className={a > 0 ? "ok" : "danger"}>{a}</span>
                  </td>
                  <td className="num price">{fmt(i.price)}</td>
                  <td className="num">
                    <QtyStepper
                      value={q}
                      max={a}
                      disabled={a <= 0}
                      onChange={(v) => onSetQty(i.id, v)}
                    />
                  </td>
                  <td className="num price">
                    {q > 0 ? fmt(i.price * q * durMult) : "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
