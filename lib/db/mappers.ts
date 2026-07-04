import type { Category, Customer, InventoryItem, RentalRecord } from "@/lib/rental/types";

export type InventoryRow = {
  id: number;
  name: string;
  qty: number;
  price: number;
  cat: string;
  no_stand: number;
  no_free: number;
  is_stand: number;
};

export type RentalRow = {
  id: string;
  date: string;
  return_date: string | null;
  cust_name: string;
  cust_reg: string;
  cust_phone: string;
  cust_addr: string;
  cust_deposit: string;
  days: number;
  dur_label: string;
  price_mode: string;
  mode_label: string;
  gross: number;
  discount: number;
  base: number;
  vat: number;
  total: number;
  status: "out" | "in";
};

export type RentalItemRow = {
  id: number;
  rental_id: string;
  item_id: number;
  name: string;
  qty: number;
  unit: number;
  is_stand: number;
  free_stand: number;
};

export function rowToInventory(row: InventoryRow): InventoryItem {
  return {
    id: row.id,
    name: row.name,
    qty: row.qty,
    price: row.price,
    cat: row.cat as Category,
    ...(row.no_stand ? { noStand: true } : {}),
    ...(row.no_free ? { noFree: true } : {}),
    ...(row.is_stand ? { isStand: true } : {}),
  };
}

export function rowToRental(
  row: RentalRow,
  items: RentalItemRow[],
): RentalRecord {
  return {
    id: row.id,
    date: row.date,
    ...(row.return_date ? { returnDate: row.return_date } : {}),
    cust: {
      name: row.cust_name,
      reg: row.cust_reg,
      phone: row.cust_phone,
      addr: row.cust_addr,
      deposit: row.cust_deposit,
    },
    days: row.days,
    durLabel: row.dur_label,
    priceMode: row.price_mode as RentalRecord["priceMode"],
    modeLabel: row.mode_label,
    items: items.map((item) => ({
      id: item.item_id,
      name: item.name,
      qty: item.qty,
      unit: item.unit,
      ...(item.is_stand ? { isStand: true } : {}),
      ...(item.free_stand ? { freeStand: true } : {}),
    })),
    gross: row.gross,
    discount: row.discount,
    base: row.base,
    vat: row.vat,
    total: row.total,
    status: row.status,
  };
}

export function customerToParams(cust: Customer) {
  return [cust.name, cust.reg, cust.phone, cust.addr, cust.deposit];
}
