import {
  categorySortIndex,
  compareInventoryItems,
  DEFAULT_CATEGORIES,
  type CategoryDef,
} from "./categories";
import type { InventoryItem } from "./types";

export const CATS = DEFAULT_CATEGORIES.map((c) => c.name);

export const bySort =
  (categories: CategoryDef[] = DEFAULT_CATEGORIES) =>
  (a: InventoryItem, b: InventoryItem) =>
    compareInventoryItems(a, b, categories);

export const VAT = 0.1;

export const fmt = (n: number) => "₮" + Math.round(n).toLocaleString("en-US");
