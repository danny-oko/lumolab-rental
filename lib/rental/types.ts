export type Category = "ГЭРЭЛ" | "FIXTURE" | "СТЕНД" | "БАТТЕРЭЙ" | "БУСАД";

export interface InventoryItem {
  id: number;
  name: string;
  qty: number;
  price: number;
  cat: Category;
  noStand?: boolean;
  noFree?: boolean;
  isStand?: boolean;
}

export interface Customer {
  name: string;
  reg: string;
  phone: string;
  addr: string;
  deposit: string;
}

export interface CartLine {
  id: string | number;
  name: string;
  qty: number;
  unit: number;
  cat: Category;
  isStand?: boolean;
  freeStand?: boolean;
  auto?: boolean;
}

export interface RentalItem {
  id: string | number;
  name: string;
  qty: number;
  unit: number;
  isStand?: boolean;
  freeStand?: boolean;
}

export interface RentalRecord {
  id: string;
  date: string;
  returnDate?: string;
  cust: Customer;
  days: number;
  durLabel: string;
  priceMode: "base" | "vat";
  modeLabel: string;
  items: RentalItem[];
  gross: number;
  discount: number;
  base: number;
  vat: number;
  total: number;
  status: "out" | "in";
}

export type TabId = "inv" | "rent" | "active";
export type PriceMode = "base" | "vat";
export type Theme = "dark" | "light";
