import { useCategories } from "@/components/rental/category-context";
import { useDragReorder } from "@/components/rental/use-drag-reorder";
import { type CategoryDef } from "@/lib/rental/categories";
import type { Category, InventoryItem } from "@/lib/rental/types";

export function CategoryDisplay({
  cat,
  suffix,
}: {
  cat: Pick<CategoryDef, "name" | "emoji">;
  suffix?: string;
}) {
  return (
    <span className="cat-display">
      <span className="cat-emoji" aria-hidden>
        {cat.emoji}
      </span>
      <span className="cat-display__label">
        {cat.name}
        {suffix}
      </span>
    </span>
  );
}

type CategoryFilterProps = {
  catFilter: Category | "all";
  inv: InventoryItem[];
  showCounts?: boolean;
  reorderable?: boolean;
  onFilterChange: (filter: Category | "all") => void;
  onReorder?: (categories: CategoryDef[]) => void | Promise<void>;
};

export function CategoryFilter({
  catFilter,
  inv,
  showCounts = false,
  reorderable = false,
  onFilterChange,
  onReorder,
}: CategoryFilterProps) {
  const categories = useCategories();
  const visibleCategories = categories.filter((c) => {
    if (!showCounts) return true;
    return inv.some((i) => i.cat === c.name);
  });

  const { getDragProps } = useDragReorder({
    items: visibleCategories,
    getKey: (c) => c.name,
    onReorder: (next) => onReorder?.(next),
    disabled: !reorderable || !onReorder,
  });

  return (
    <div className={`pill-row${reorderable ? " pill-row--reorderable" : ""}`}>
      <button
        type="button"
        className={"btn sm " + (catFilter === "all" ? "" : "ghost")}
        onClick={() => onFilterChange("all")}
      >
        Бүгд{showCounts ? ` (${inv.length})` : ""}
      </button>
      {visibleCategories.map((c) => {
        const n = inv.filter((i) => i.cat === c.name).length;
        const dragProps = reorderable ? getDragProps(c) : {};
        return (
          <button
            key={c.name}
            type="button"
            className={[
              "btn sm",
              catFilter === c.name ? "" : "ghost",
              reorderable ? "pill-draggable" : "",
            ]
              .filter(Boolean)
              .join(" ")}
            onClick={() => onFilterChange(c.name)}
            title={reorderable ? "Чирж эрэмбэлэх" : undefined}
            {...dragProps}
          >
            {reorderable && <span className="drag-handle" aria-hidden>⋮⋮</span>}
            <CategoryDisplay
              cat={c}
              suffix={showCounts ? ` (${n})` : undefined}
            />
          </button>
        );
      })}
    </div>
  );
}

export function CategoryLabel({ name }: { name: string }) {
  const categories = useCategories();
  const cat = categories.find((c) => c.name === name);
  return cat ? <CategoryDisplay cat={cat} /> : <>{name}</>;
}
