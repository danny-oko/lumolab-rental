import { CATS } from "@/lib/rental/constants";
import type { Category, InventoryItem } from "@/lib/rental/types";

type CategoryFilterProps = {
  catFilter: Category | "all";
  inv: InventoryItem[];
  showCounts?: boolean;
  onFilterChange: (filter: Category | "all") => void;
};

export function CategoryFilter({
  catFilter,
  inv,
  showCounts = false,
  onFilterChange,
}: CategoryFilterProps) {
  return (
    <div className="pill-row">
      <button
        type="button"
        className={"btn sm " + (catFilter === "all" ? "" : "ghost")}
        onClick={() => onFilterChange("all")}
      >
        Бүгд{showCounts ? ` (${inv.length})` : ""}
      </button>
      {CATS.map((c) => {
        const n = inv.filter((i) => i.cat === c).length;
        return (
          <button
            key={c}
            type="button"
            className={"btn sm " + (catFilter === c ? "" : "ghost")}
            onClick={() => onFilterChange(c)}
          >
            {c}
            {showCounts ? ` (${n})` : ""}
          </button>
        );
      })}
    </div>
  );
}
