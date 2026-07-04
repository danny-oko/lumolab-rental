import { CategoryFilter } from "@/components/rental/category-filter";
import { ItemNameCell } from "@/components/rental/item-name-cell";
import { CATS } from "@/lib/rental/constants";
import type { Category, InventoryItem } from "@/lib/rental/types";

type InventoryPanelProps = {
  inv: InventoryItem[];
  filteredInv: InventoryItem[];
  catFilter: Category | "all";
  avail: (id: number) => number;
  onFilterChange: (filter: Category | "all") => void;
  onEditStock: (
    id: number,
    field: keyof InventoryItem,
    val: string | number,
  ) => void;
};

export function InventoryPanel({
  inv,
  filteredInv,
  catFilter,
  avail,
  onFilterChange,
  onEditStock,
}: InventoryPanelProps) {
  return (
    <div className="panel">
      <div className="panel-head">
        <strong>Бүх бараа (Авах техникийн жагсаалт)</strong>
        <span className="muted small">
          Үнэ = 12 цагийн <b>НӨАТ-гүй</b> суурь дүн. Тоо ширхэг, үнэ, төрөл
          засаж болно.
        </span>
      </div>

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
              <th className="col-inv-qty num col-center">Нийт</th>
              <th className="col-inv-avail num col-center">Бэлэн</th>
              <th className="col-inv-price num col-center">Үнэ (12ц)</th>
              <th className="col-inv-status">Төлөв</th>
            </tr>
          </thead>
          <tbody>
            {filteredInv.map((i) => {
              const a = avail(i.id);
              return (
                <tr key={i.id}>
                  <td className="col-inv-name">
                    <ItemNameCell item={i} variant="inventory" />
                  </td>
                  <td className="col-inv-cat col-cat">
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
                  </td>
                  <td className="col-inv-qty num col-center">
                    <input
                      type="number"
                      className="input-sm"
                      value={i.qty}
                      onChange={(e) => onEditStock(i.id, "qty", e.target.value)}
                    />
                  </td>
                  <td className="col-inv-avail num col-center">
                    <span className={a > 0 ? "ok" : "danger"}>{a}</span>
                  </td>
                  <td className="col-inv-price num col-center">
                    <input
                      type="number"
                      className="input-md"
                      value={i.price}
                      onChange={(e) =>
                        onEditStock(i.id, "price", e.target.value)
                      }
                    />
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
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="hr" />
      <p className="panel-note">
        Ray гэрэл (660C/360C/120C) түрээслэхэд стенд автоматаар ₮0-р
        дагалдана. Ace25C, Halo 60x, B7C Bulb-д стенд дагалдахгүй. Combo
        stand нь тусдаа бүтээгдэхүүн бөгөөд үнэгүй дагалдахгүй.
      </p>
    </div>
  );
}
