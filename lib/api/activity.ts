import { insertActivityLog } from "@/lib/db/activity-log";
import type { InventoryItem, RentalRecord } from "@/lib/rental/types";

export async function logInventoryCreate(item: InventoryItem) {
  await insertActivityLog({
    kind: "inventory",
    action: "create",
    entityId: String(item.id),
    summary: `Шинэ бараа: ${item.name}`,
    detail: `${item.cat} · ${item.qty} ш · ₮${item.price}`,
  });
}

export async function logInventoryUpdate(item: InventoryItem, field: string) {
  await insertActivityLog({
    kind: "inventory",
    action: "update",
    entityId: String(item.id),
    summary: `Засвар: ${item.name}`,
    detail: field,
  });
}

export async function logInventoryFlags(item: InventoryItem) {
  await insertActivityLog({
    kind: "inventory",
    action: "update",
    entityId: String(item.id),
    summary: `Тэмдэглэл: ${item.name}`,
    detail: "flags",
  });
}

export async function logInventoryDelete(item: InventoryItem) {
  await insertActivityLog({
    kind: "inventory",
    action: "delete",
    entityId: String(item.id),
    summary: `Устгасан: ${item.name}`,
  });
}

export async function logRentalCheckout(rental: RentalRecord) {
  await insertActivityLog({
    kind: "rental",
    action: "checkout",
    entityId: rental.id,
    summary: `Гаргасан: ${rental.cust.name}`,
    detail: `${rental.items.length} бараа · ${fmtTotal(rental.total)}`,
  });
}

export async function logRentalReturn(rental: RentalRecord) {
  await insertActivityLog({
    kind: "rental",
    action: "return",
    entityId: rental.id,
    summary: `Ирүүлсэн: ${rental.cust.name}`,
    detail: rental.returnDate ?? "",
  });
}

export async function logRentalDelete(rental: RentalRecord) {
  await insertActivityLog({
    kind: "rental",
    action: "delete",
    entityId: rental.id,
    summary: `Устгасан: ${rental.cust.name}`,
    detail: `${rental.items.length} бараа · ${fmtTotal(rental.total)}`,
  });
}

function fmtTotal(n: number) {
  return `₮${n.toLocaleString("mn-MN")}`;
}
