import { compareInventoryItems, DEFAULT_CATEGORIES } from "./categories";
import type { CartLine, InventoryItem, RentalRecord } from "./types";

/** Cart lines use composite ids (e.g. `5_free`, `3_auto`) for UI keys; DB needs the inventory id. */
export function resolveInventoryItemId(id: string | number): number {
  if (typeof id === "number" && Number.isFinite(id)) return id;
  const raw = String(id);
  const direct = Number(raw);
  if (Number.isFinite(direct)) return direct;
  const parsed = Number(raw.split("_")[0]);
  if (Number.isFinite(parsed)) return parsed;
  throw new Error(`Invalid inventory item id: ${id}`);
}

export function buildOutMap(rentals: RentalRecord[]) {
  const m: Record<number, number> = {};
  rentals
    .filter((r) => r.status === "out")
    .forEach((r) => {
      r.items.forEach((it) => {
        const id = typeof it.id === "number" ? it.id : parseInt(String(it.id), 10);
        if (!Number.isNaN(id)) m[id] = (m[id] || 0) + it.qty;
      });
    });
  return m;
}

export function calcFreeEntitlement(
  cart: Record<number, number>,
  inv: InventoryItem[],
) {
  return Object.entries(cart).reduce((s, [id, q]) => {
    const it = inv.find((i) => i.id === +id);
    return s + (it && it.cat === "ГЭРЭЛ" && !it.noStand ? q : 0);
  }, 0);
}

export function buildCartLines(
  cart: Record<number, number>,
  inv: InventoryItem[],
  freeEntitlement: number,
  standItems: InventoryItem[],
  outMap: Record<number, number>,
): CartLine[] {
  const L: CartLine[] = [];
  let freeLeft = freeEntitlement;
  const remainFree: Record<number, number> = {};
  standItems
    .filter((s) => !s.noFree)
    .forEach((si) => {
      remainFree[si.id] = Math.max(0, si.qty - (outMap[si.id] || 0));
    });

  const cartIds = Object.keys(cart)
    .map(Number)
    .filter((id) => (cart[id] || 0) > 0);
  const cartItems = inv
    .filter((i) => cartIds.includes(i.id))
    .sort((a, b) => compareInventoryItems(a, b, DEFAULT_CATEGORIES));

  const eligStandIdsInCart = cartItems
    .filter((i) => i.isStand && !i.noFree)
    .sort((a, b) => a.price - b.price)
    .map((i) => i.id);
  const freeFromCart: Record<number, number> = {};
  for (const id of eligStandIdsInCart) {
    if (freeLeft <= 0) break;
    const q = cart[id];
    const take = Math.min(q, freeLeft);
    freeFromCart[id] = take;
    freeLeft -= take;
    remainFree[id] -= take;
  }

  cartItems.forEach((it) => {
    const q = cart[it.id];
    if (it.isStand && freeFromCart[it.id]) {
      const f = freeFromCart[it.id];
      const pd = q - f;
      if (pd > 0)
        L.push({
          id: it.id,
          name: it.name,
          qty: pd,
          unit: it.price,
          cat: it.cat,
          isStand: true,
        });
      L.push({
        id: `${it.id}_free`,
        name: it.name,
        qty: f,
        unit: 0,
        cat: it.cat,
        isStand: true,
        freeStand: true,
      });
    } else {
      L.push({
        id: it.id,
        name: it.name,
        qty: q,
        unit: it.price,
        cat: it.cat,
        isStand: it.isStand,
      });
    }
  });

  if (freeLeft > 0) {
    [...standItems]
      .filter((s) => !s.noFree)
      .sort((a, b) => a.price - b.price)
      .forEach((si) => {
        if (freeLeft <= 0) return;
        const take = Math.min(remainFree[si.id] || 0, freeLeft);
        if (take > 0) {
          L.push({
            id: `${si.id}_auto`,
            name: si.name,
            qty: take,
            unit: 0,
            cat: si.cat,
            isStand: true,
            freeStand: true,
            auto: true,
          });
          freeLeft -= take;
          remainFree[si.id] -= take;
        }
      });
  }

  return L;
}

export function calcFreeShort(lines: CartLine[], freeEntitlement: number) {
  const got = lines.filter((l) => l.freeStand).reduce((s, l) => s + l.qty, 0);
  return Math.max(0, freeEntitlement - got);
}

export function calcDuration(days: number) {
  const durMult = days === 0.5 ? 1.0 : 1.3 * days;
  const longDiscount = days >= 4 ? 0.1 : 0;
  const durLabel =
    days === 0.5
      ? "12 цаг"
      : days === 1
        ? "24 цаг"
        : `${days} өдөр${days >= 4 ? " (-10%)" : ""}`;
  return { durMult, longDiscount, durLabel };
}

export function calcTotals(
  lines: CartLine[],
  durMult: number,
  longDiscount: number,
  priceMode: "base" | "vat",
  vatRate: number,
) {
  const grossDur = lines.reduce((s, l) => s + l.unit * l.qty * durMult, 0);
  const discountAmt = grossDur * longDiscount;
  const base = grossDur - discountAmt;
  const addVat = priceMode === "vat";
  const vatAmt = addVat ? base * vatRate : 0;
  const charged = base + vatAmt;
  return { grossDur, discountAmt, base, addVat, vatAmt, charged };
}
