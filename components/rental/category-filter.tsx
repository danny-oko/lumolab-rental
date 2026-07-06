import { useCategories } from "@/components/rental/category-context";
import { useDragReorder } from "@/components/rental/use-drag-reorder";
import { formatCategoryLabel, type CategoryDef } from "@/lib/rental/categories";
import type { Category, InventoryItem } from "@/lib/rental/types";

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
            {c.name}
            {showCounts ? ` (${n})` : ""}
          </button>
        );
      })}
    </div>
  );
}

export function CategoryLabel({ name }: { name: string }) {
  return <>{formatCategoryLabel(name)}</>;
}
