import { d1All, d1Batch, d1Run } from "@/lib/db/d1";
import {
  customerToParams,
  rowToInventory,
  rowToRental,
  type InventoryRow,
  type RentalItemRow,
  type RentalRow,
} from "@/lib/db/mappers";
import { resolveInventoryItemId } from "@/lib/rental/pricing";
import type { InventoryItem, RentalRecord } from "@/lib/rental/types";

export type NewInventoryItem = Omit<InventoryItem, "id">;

export class InventoryInUseError extends Error {
  activeQty: number;

  constructor(activeQty: number) {
    super("Item is on an active rental");
    this.name = "InventoryInUseError";
    this.activeQty = activeQty;
  }
}

export async function listInventory(): Promise<InventoryItem[]> {
  const rows = await d1All<InventoryRow>(
    "SELECT * FROM inventory ORDER BY id ASC",
  );
  return rows.map(rowToInventory);
}

export async function updateInventoryItem(
  id: number,
  field: keyof InventoryItem,
  value: string | number | boolean,
): Promise<InventoryItem | null> {
  const columnMap: Partial<Record<keyof InventoryItem, string>> = {
    name: "name",
    qty: "qty",
    price: "price",
    cat: "cat",
    noStand: "no_stand",
    noFree: "no_free",
    isStand: "is_stand",
  };

  const column = columnMap[field];
  if (!column) return null;

  const dbValue =
    field === "noStand" || field === "noFree" || field === "isStand"
      ? value
        ? 1
        : 0
      : value;

  await d1Run(`UPDATE inventory SET ${column} = ? WHERE id = ?`, [
    dbValue,
    id,
  ]);

  const row = await d1All<InventoryRow>(
    "SELECT * FROM inventory WHERE id = ?",
    [id],
  );
  return row[0] ? rowToInventory(row[0]) : null;
}

export async function updateInventoryFlags(
  id: number,
  flags: { isStand: boolean; noStand: boolean; noFree: boolean },
): Promise<InventoryItem | null> {
  await d1Run(
    `UPDATE inventory SET is_stand = ?, no_stand = ?, no_free = ? WHERE id = ?`,
    [flags.isStand ? 1 : 0, flags.noStand ? 1 : 0, flags.noFree ? 1 : 0, id],
  );

  const row = await d1All<InventoryRow>(
    "SELECT * FROM inventory WHERE id = ?",
    [id],
  );
  return row[0] ? rowToInventory(row[0]) : null;
}

export async function createInventoryItem(
  item: NewInventoryItem,
): Promise<InventoryItem> {
  const [{ next_id }] = await d1All<{ next_id: number }>(
    "SELECT COALESCE(MAX(id), 0) + 1 AS next_id FROM inventory",
  );

  await d1Run(
    `INSERT INTO inventory (id, name, qty, price, cat, no_stand, no_free, is_stand)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      next_id,
      item.name.trim(),
      item.qty,
      item.price,
      item.cat,
      item.noStand ? 1 : 0,
      item.noFree ? 1 : 0,
      item.isStand ? 1 : 0,
    ],
  );

  const row = await d1All<InventoryRow>("SELECT * FROM inventory WHERE id = ?", [
    next_id,
  ]);
  if (!row[0]) throw new Error("Failed to create inventory item");
  return rowToInventory(row[0]);
}

export async function countActiveRentalQty(itemId: number): Promise<number> {
  const rows = await d1All<{ total: number }>(
    `SELECT COALESCE(SUM(ri.qty), 0) AS total
     FROM rental_items ri
     INNER JOIN rentals r ON r.id = ri.rental_id
     WHERE ri.item_id = ? AND r.status = 'out'`,
    [itemId],
  );
  return rows[0]?.total ?? 0;
}

export async function deleteInventoryItem(
  id: number,
): Promise<InventoryItem | null> {
  const rows = await d1All<InventoryRow>(
    "SELECT * FROM inventory WHERE id = ?",
    [id],
  );
  if (!rows[0]) return null;

  const activeQty = await countActiveRentalQty(id);
  if (activeQty > 0) throw new InventoryInUseError(activeQty);

  await d1Run("DELETE FROM inventory WHERE id = ?", [id]);
  return rowToInventory(rows[0]);
}

export async function listRentals(): Promise<RentalRecord[]> {
  const rentalRows = await d1All<RentalRow>(
    "SELECT * FROM rentals ORDER BY date DESC, id DESC",
  );

  if (rentalRows.length === 0) return [];

  const itemRows = await d1All<RentalItemRow>(
    "SELECT * FROM rental_items ORDER BY rental_id, id ASC",
  );

  const itemsByRental = new Map<string, RentalItemRow[]>();
  for (const item of itemRows) {
    const list = itemsByRental.get(item.rental_id) ?? [];
    list.push(item);
    itemsByRental.set(item.rental_id, list);
  }

  return rentalRows.map((row) =>
    rowToRental(row, itemsByRental.get(row.id) ?? []),
  );
}

export async function createRental(rental: RentalRecord): Promise<RentalRecord> {
  const statements = [
    {
      sql: `INSERT INTO rentals (
        id, date, return_date, cust_name, cust_reg, cust_phone, cust_addr, cust_deposit,
        days, dur_label, price_mode, mode_label, gross, discount, base, vat, total, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      params: [
        rental.id,
        rental.date,
        rental.returnDate ?? null,
        ...customerToParams(rental.cust),
        rental.days,
        rental.durLabel,
        rental.priceMode,
        rental.modeLabel,
        rental.gross,
        rental.discount,
        rental.base,
        rental.vat,
        rental.total,
        rental.status,
      ],
    },
    ...rental.items.map((item) => ({
      sql: `INSERT INTO rental_items (
        rental_id, item_id, name, qty, unit, is_stand, free_stand
      ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      params: [
        rental.id,
        resolveInventoryItemId(item.id),
        item.name,
        item.qty,
        item.unit,
        item.isStand ? 1 : 0,
        item.freeStand ? 1 : 0,
      ],
    })),
  ];

  await d1Batch(statements);
  return rental;
}

export async function returnRental(
  id: string,
  returnDate: string,
): Promise<RentalRecord | null> {
  await d1Run(
    "UPDATE rentals SET status = 'in', return_date = ? WHERE id = ? AND status = 'out'",
    [returnDate, id],
  );

  const row = await d1All<RentalRow>("SELECT * FROM rentals WHERE id = ?", [
    id,
  ]);
  if (!row[0]) return null;

  const items = await d1All<RentalItemRow>(
    "SELECT * FROM rental_items WHERE rental_id = ? ORDER BY id ASC",
    [id],
  );

  return rowToRental(row[0], items);
}

export async function deleteRental(id: string): Promise<RentalRecord | null> {
  const row = await d1All<RentalRow>("SELECT * FROM rentals WHERE id = ?", [
    id,
  ]);
  if (!row[0]) return null;

  const items = await d1All<RentalItemRow>(
    "SELECT * FROM rental_items WHERE rental_id = ? ORDER BY id ASC",
    [id],
  );

  await d1Batch([
    { sql: "DELETE FROM rental_items WHERE rental_id = ?", params: [id] },
    { sql: "DELETE FROM rentals WHERE id = ?", params: [id] },
  ]);

  return rowToRental(row[0], items);
}

export async function deleteAllRentals(): Promise<number> {
  const countRow = await d1All<{ count: number }>(
    "SELECT COUNT(*) AS count FROM rentals",
  );
  const count = countRow[0]?.count ?? 0;
  if (count === 0) return 0;

  await d1Batch([
    { sql: "DELETE FROM rental_items" },
    { sql: "DELETE FROM rentals" },
  ]);

  return count;
}
