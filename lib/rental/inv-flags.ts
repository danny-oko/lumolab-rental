import type { InventoryItem } from "@/lib/rental/types";

export type InvFlagMode = "" | "isStand" | "noStand" | "noFree";

export const INV_FLAG_OPTIONS: { value: InvFlagMode; label: string }[] = [
  { value: "", label: "Энгийн" },
  { value: "isStand", label: "Стенд" },
  { value: "noStand", label: "Стендгүй" },
  { value: "noFree", label: "Үнэгүй биш" },
];

export function getInvFlagMode(
  item: Pick<InventoryItem, "isStand" | "noStand" | "noFree">,
): InvFlagMode {
  if (item.isStand) return "isStand";
  if (item.noStand) return "noStand";
  if (item.noFree) return "noFree";
  return "";
}

export function flagModeToFlags(mode: InvFlagMode) {
  return {
    isStand: mode === "isStand",
    noStand: mode === "noStand",
    noFree: mode === "noFree",
  };
}

export function applyFlagMode(item: InventoryItem, mode: InvFlagMode): InventoryItem {
  const next = { ...item };
  delete next.isStand;
  delete next.noStand;
  delete next.noFree;
  if (mode === "isStand") next.isStand = true;
  if (mode === "noStand") next.noStand = true;
  if (mode === "noFree") next.noFree = true;
  return next;
}

export function flagModeToItemFlags(
  mode: InvFlagMode,
): Pick<InventoryItem, "isStand" | "noStand" | "noFree"> {
  if (mode === "isStand") return { isStand: true };
  if (mode === "noStand") return { noStand: true };
  if (mode === "noFree") return { noFree: true };
  return {};
}
