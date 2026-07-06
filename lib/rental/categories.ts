import type { InventoryItem } from "./types";

export type CategoryDef = {
  name: string;
  emoji: string;
  sortOrder: number;
  builtin?: boolean;
};

export type NewCategoryInput = Pick<CategoryDef, "name" | "emoji">;

export const DEFAULT_CATEGORIES: CategoryDef[] = [
  { name: "ГЭРЭЛ", emoji: "💡", sortOrder: 0, builtin: true },
  { name: "FIXTURE", emoji: "🪩", sortOrder: 1, builtin: true },
  { name: "СТЕНД", emoji: "🎬", sortOrder: 2, builtin: true },
  { name: "БАТТЕРЭЙ", emoji: "🔋", sortOrder: 3, builtin: true },
  { name: "БУСАД", emoji: "📦", sortOrder: 4, builtin: true },
];

export const FALLBACK_EMOJI = "📁";

const CUSTOM_CATS_KEY = "lumo-lab-custom-categories";

export function normalizeCategoryName(name: string): string {
  return name.trim().toUpperCase();
}

/** First grapheme from user input — works for emoji and regular characters. */
export function pickCategoryIcon(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return "";
  if (typeof Intl !== "undefined" && "Segmenter" in Intl) {
    const seg = new Intl.Segmenter().segment(trimmed);
    const first = [...seg][0];
    return first?.segment ?? trimmed;
  }
  return Array.from(trimmed)[0] ?? "";
}

/** One-time migration helper: read legacy localStorage categories. */
export function readLegacyCustomCategories(): CategoryDef[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(CUSTOM_CATS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((entry, index) => {
        if (!entry || typeof entry !== "object") return null;
        const name = normalizeCategoryName(
          String((entry as CategoryDef).name ?? ""),
        );
        const emoji = String((entry as CategoryDef).emoji ?? FALLBACK_EMOJI);
        if (!name) return null;
        return { name, emoji, sortOrder: 100 + index };
      })
      .filter((c): c is CategoryDef => c !== null);
  } catch {
    return [];
  }
}

export function clearLegacyCustomCategories(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(CUSTOM_CATS_KEY);
}

export function mergeCategories(
  inv: InventoryItem[] = [],
  stored: CategoryDef[] = DEFAULT_CATEGORIES,
): CategoryDef[] {
  const map = new Map<string, CategoryDef>();
  for (const c of stored) map.set(c.name, c);
  let nextOrder =
    stored.reduce((max, c) => Math.max(max, c.sortOrder), -1) + 1;
  for (const item of inv) {
    if (!map.has(item.cat)) {
      map.set(item.cat, {
        name: item.cat,
        emoji: FALLBACK_EMOJI,
        sortOrder: nextOrder++,
      });
    }
  }

  return [...map.values()].sort(
    (a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name, "mn"),
  );
}

export function getCategoryEmoji(
  name: string,
  categories: CategoryDef[] = DEFAULT_CATEGORIES,
): string {
  return categories.find((c) => c.name === name)?.emoji ?? FALLBACK_EMOJI;
}

export function formatCategoryLabel(name: string): string {
  return name;
}

export function formatCategoryDisplay(
  cat: Pick<CategoryDef, "name" | "emoji">,
): string {
  return `${cat.emoji} ${cat.name}`;
}

export function categorySortIndex(
  name: string,
  categories: CategoryDef[] = DEFAULT_CATEGORIES,
): number {
  const idx = categories.findIndex((c) => c.name === name);
  return idx === -1 ? 999 : idx;
}

export function compareInventoryItems(
  a: InventoryItem,
  b: InventoryItem,
  _categories: CategoryDef[] = DEFAULT_CATEGORIES,
): number {
  return a.sortOrder - b.sortOrder || a.id - b.id;
}
