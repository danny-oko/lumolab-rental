import type { Category, InventoryItem } from "./types";

export const CATS: Category[] = ["ГЭРЭЛ", "FIXTURE", "СТЕНД", "БАТТЕРЭЙ", "БУСАД"];

export const CAT_ORDER: Record<Category, number> = {
  ГЭРЭЛ: 0,
  FIXTURE: 1,
  СТЕНД: 2,
  БАТТЕРЭЙ: 3,
  БУСАД: 4,
};

export const bySort = (a: InventoryItem, b: InventoryItem) =>
  (CAT_ORDER[a.cat] ?? 9) - (CAT_ORDER[b.cat] ?? 9) || a.id - b.id;

export const VAT = 0.1;

export const fmt = (n: number) => "₮" + Math.round(n).toLocaleString("en-US");
