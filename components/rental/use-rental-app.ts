"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { bySort, VAT } from "@/lib/rental/constants";
import { emptyCustomer } from "@/lib/rental/empty-customer";
import {
  buildCartLines,
  buildOutMap,
  calcDuration,
  calcFreeEntitlement,
  calcFreeShort,
  calcTotals,
} from "@/lib/rental/pricing";
import type {
  Category,
  Customer,
  InventoryItem,
  PriceMode,
  RentalRecord,
  TabId,
  Theme,
} from "@/lib/rental/types";

async function apiJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || `Request failed (${res.status})`);
  }
  return data as T;
}

export function useRentalApp() {
  const [tab, setTab] = useState<TabId>("inv");
  const [inv, setInv] = useState<InventoryItem[]>([]);
  const [cart, setCart] = useState<Record<number, number>>({});
  const [days, setDays] = useState(0.5);
  const [rentals, setRentals] = useState<RentalRecord[]>([]);
  const [cust, setCust] = useState<Customer>(emptyCustomer);
  const [priceMode, setPriceMode] = useState<PriceMode>("base");
  const [catFilter, setCatFilter] = useState<Category | "all">("all");
  const [theme, setTheme] = useState<Theme>("dark");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [inventory, rentalList] = await Promise.all([
        apiJson<InventoryItem[]>("/api/inventory"),
        apiJson<RentalRecord[]>("/api/rentals"),
      ]);
      setInv(inventory);
      setRentals(rentalList);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const standItems = useMemo(() => inv.filter((i) => i.isStand), [inv]);
  const standTotalQty = standItems.reduce((s, i) => s + i.qty, 0);

  const outMap = useMemo(() => buildOutMap(rentals), [rentals]);

  const avail = (id: number) => {
    const it = inv.find((i) => i.id === id);
    return (it?.qty ?? 0) - (outMap[id] || 0);
  };

  const freeEntitlement = useMemo(
    () => calcFreeEntitlement(cart, inv),
    [cart, inv],
  );

  const standsOut = standItems.reduce((s, i) => s + (outMap[i.id] || 0), 0);
  const standsAvail = standTotalQty - standsOut;

  const { durMult, longDiscount, durLabel } = calcDuration(days);

  const lines = useMemo(
    () => buildCartLines(cart, inv, freeEntitlement, standItems, outMap),
    [cart, inv, freeEntitlement, standItems, outMap],
  );

  const freeShort = calcFreeShort(lines, freeEntitlement);

  const { grossDur, discountAmt, base, addVat, vatAmt, charged } = calcTotals(
    lines,
    durMult,
    longDiscount,
    priceMode,
    VAT,
  );

  const setQty = (id: number, v: number) => {
    const max = avail(id);
    const q = Math.max(0, Math.min(max, v));
    setCart((c) => ({ ...c, [id]: q }));
  };

  const cartCount = Object.values(cart).filter((q) => q > 0).length;

  async function checkout() {
    try {
      if (lines.length === 0) {
        alert("Эхлээд бараа сонгоно уу.");
        return;
      }
      if (!cust.name || !cust.name.trim()) {
        alert("Түрээслэгчийн нэрийг бөглөнө үү.");
        return;
      }
      if (freeShort > 0) {
        const ok = confirm(
          `Анхаар: ${freeShort} үнэгүй стенд бэлэн байхгүй тул дагалдуулж чадсангүй (Combo stand үнэгүй биш). Үргэлжлүүлэх үү?`,
        );
        if (!ok) return;
      }

      const rec: RentalRecord = {
        id: "R" + Date.now().toString().slice(-6),
        date: new Date().toISOString().slice(0, 10),
        cust: { ...cust },
        days,
        durLabel,
        priceMode,
        modeLabel: priceMode === "vat" ? "НӨАТ-тай (+10%)" : "НӨАТ-гүй",
        items: lines.map((l) => ({
          id: l.id,
          name: l.name,
          qty: l.qty,
          unit: l.unit,
          isStand: l.isStand,
          freeStand: l.freeStand,
        })),
        gross: grossDur,
        discount: discountAmt,
        base,
        vat: vatAmt,
        total: charged,
        status: "out",
      };

      setBusy(true);
      const created = await apiJson<RentalRecord>("/api/rentals", {
        method: "POST",
        body: JSON.stringify(rec),
      });

      setRentals((r) => [created, ...r]);
      setCart({});
      setDays(0.5);
      setCust(emptyCustomer);
      setTab("active");
    } catch (err) {
      alert("Алдаа гарлаа: " + (err instanceof Error ? err.message : String(err)));
      console.error(err);
    } finally {
      setBusy(false);
    }
  }

  async function returnRental(rid: string) {
    try {
      setBusy(true);
      const updated = await apiJson<RentalRecord>(`/api/rentals/${rid}/return`, {
        method: "POST",
      });
      setRentals((rs) => rs.map((r) => (r.id === rid ? updated : r)));
    } catch (err) {
      alert("Алдаа гарлаа: " + (err instanceof Error ? err.message : String(err)));
      console.error(err);
    } finally {
      setBusy(false);
    }
  }

  async function editStock(
    id: number,
    field: keyof InventoryItem,
    val: string | number,
  ) {
    const strFields: (keyof InventoryItem)[] = ["name", "cat"];
    const nextVal = strFields.includes(field) ? val : +val || 0;

    setInv((iv) =>
      iv.map((i) => (i.id === id ? { ...i, [field]: nextVal } : i)),
    );

    try {
      const updated = await apiJson<InventoryItem>("/api/inventory", {
        method: "PATCH",
        body: JSON.stringify({ id, field, value: nextVal }),
      });
      setInv((iv) => iv.map((i) => (i.id === id ? updated : i)));
    } catch (err) {
      void loadData();
      alert("Алдаа гарлаа: " + (err instanceof Error ? err.message : String(err)));
      console.error(err);
    }
  }

  const totalSku = inv.length;
  const activeR = rentals.filter((r) => r.status === "out").length;
  const filteredInv = inv
    .filter((i) => catFilter === "all" || i.cat === catFilter)
    .sort(bySort);

  const availableTotal = inv.reduce((s, i) => s + avail(i.id), 0);
  const outTotal = Object.values(outMap).reduce((s, n) => s + n, 0);

  return {
    tab,
    setTab,
    inv,
    cart,
    days,
    setDays,
    rentals,
    cust,
    setCust,
    priceMode,
    setPriceMode,
    catFilter,
    setCatFilter,
    theme,
    setTheme,
    loading,
    error,
    busy,
    reload: loadData,
    avail,
    freeEntitlement,
    standsAvail,
    durMult,
    longDiscount,
    durLabel,
    lines,
    freeShort,
    grossDur,
    discountAmt,
    base,
    addVat,
    vatAmt,
    charged,
    cartCount,
    totalSku,
    activeR,
    filteredInv,
    availableTotal,
    outTotal,
    setQty,
    checkout,
    returnRental,
    editStock,
  };
}

export type RentalAppState = ReturnType<typeof useRentalApp>;
