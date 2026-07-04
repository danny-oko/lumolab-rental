"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
import {
  applyFlagMode,
  getInvFlagMode,
  type InvFlagMode,
} from "@/lib/rental/inv-flags";
import type {
  Category,
  Customer,
  InventoryItem,
  PriceMode,
  RentalHistoryFilter,
  RentalRecord,
  TabId,
  Theme,
} from "@/lib/rental/types";
import {
  readUserSettings,
  resolveUserSettings,
  writeUserSettings,
} from "@/lib/rental/user-settings";
import { useConfirmDialog } from "@/components/rental/use-confirm-dialog";
import { useAlertDialog } from "@/components/rental/use-alert-dialog";

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

export type InventorySyncState = "idle" | "saving" | "saved" | "error";
type InvEditableField = "name" | "cat" | "qty" | "price" | "flag";

const SAVED_MS = 2000;
const SYNC_INTERVAL_MS = 5000;

function baselineFrom(items: InventoryItem[]) {
  return new Map(items.map((i) => [i.id, { ...i }]));
}

function getDirtyFields(
  item: InventoryItem,
  saved: InventoryItem,
): InvEditableField[] {
  const fields: InvEditableField[] = [];
  if (item.name !== saved.name) fields.push("name");
  if (item.cat !== saved.cat) fields.push("cat");
  if (item.qty !== saved.qty) fields.push("qty");
  if (item.price !== saved.price) fields.push("price");
  if (getInvFlagMode(item) !== getInvFlagMode(saved)) fields.push("flag");
  return fields;
}

function mergeInventory(
  server: InventoryItem[],
  local: InventoryItem[],
  pendingIds: Set<number>,
): InventoryItem[] {
  const localById = new Map(local.map((i) => [i.id, i]));
  return server
    .map((item) => (pendingIds.has(item.id) ? (localById.get(item.id) ?? item) : item))
    .sort(bySort);
}

function clampCart(
  cart: Record<number, number>,
  inventory: InventoryItem[],
  rentalList: RentalRecord[],
): Record<number, number> {
  const outMap = buildOutMap(rentalList);
  let changed = false;
  const next = { ...cart };
  for (const [idStr, qty] of Object.entries(cart)) {
    if (qty <= 0) continue;
    const id = Number(idStr);
    const it = inventory.find((i) => i.id === id);
    const max = (it?.qty ?? 0) - (outMap[id] || 0);
    if (qty > max) {
      if (max <= 0) delete next[id];
      else next[id] = max;
      changed = true;
    }
  }
  return changed ? next : cart;
}

export function useRentalApp() {
  const { confirm, confirmState } = useConfirmDialog();
  const { showAlert, alertState } = useAlertDialog();

  const showError = useCallback(
    (err: unknown) =>
      showAlert({
        danger: true,
        message: err instanceof Error ? err.message : String(err),
      }),
    [showAlert],
  );

  const [tab, setTab] = useState<TabId>("inv");
  const [inv, setInv] = useState<InventoryItem[]>([]);
  const [cart, setCart] = useState<Record<number, number>>({});
  const [days, setDays] = useState(0.5);
  const [rentals, setRentals] = useState<RentalRecord[]>([]);
  const [rentalFilter, setRentalFilter] = useState<RentalHistoryFilter>("all");
  const [cust, setCust] = useState<Customer>(emptyCustomer);
  const [priceMode, setPriceMode] = useState<PriceMode>("base");
  const [catFilter, setCatFilter] = useState<Category | "all">("all");
  const [theme, setTheme] = useState<Theme>("dark");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [invBaseline, setInvBaseline] = useState<Map<number, InventoryItem>>(
    () => new Map(),
  );
  const [invEditing, setInvEditing] = useState(false);
  const [invSaveState, setInvSaveState] = useState<InventorySyncState>("idle");
  const savedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const invRef = useRef(inv);
  const invBaselineRef = useRef(invBaseline);
  const invSavingRef = useRef(false);
  const busyRef = useRef(busy);
  const syncingRef = useRef(false);
  const settingsHydratedRef = useRef(false);

  useEffect(() => {
    const settings = resolveUserSettings(readUserSettings());
    setTheme(settings.theme);
    setPriceMode(settings.priceMode);
    setCatFilter(settings.catFilter);
    setRentalFilter(settings.rentalFilter);
    settingsHydratedRef.current = true;
  }, []);

  useEffect(() => {
    if (!settingsHydratedRef.current) return;
    writeUserSettings({ theme, priceMode, catFilter, rentalFilter });
  }, [theme, priceMode, catFilter, rentalFilter]);

  useEffect(() => {
    invRef.current = inv;
  }, [inv]);

  useEffect(() => {
    invBaselineRef.current = invBaseline;
  }, [invBaseline]);

  useEffect(() => {
    busyRef.current = busy;
  }, [busy]);

  const pendingInventoryIds = useCallback((): Set<number> => {
    const pending = new Set<number>();
    for (const item of invRef.current) {
      const saved = invBaselineRef.current.get(item.id);
      if (!saved) continue;
      if (getDirtyFields(item, saved).length > 0) pending.add(item.id);
    }
    return pending;
  }, []);

  const applyServerData = useCallback(
    (
      inventory: InventoryItem[],
      rentalList: RentalRecord[],
      fullLoad = false,
    ) => {
      const pending = pendingInventoryIds();
      setInv((current) => mergeInventory(inventory, current, pending));
      setInvBaseline((prev) => {
        if (fullLoad) return baselineFrom(inventory);
        const next = new Map(prev);
        for (const item of inventory) {
          if (!pending.has(item.id)) next.set(item.id, { ...item });
        }
        return next;
      });
      setRentals(rentalList);
      setCart((c) => clampCart(c, inventory, rentalList));
    },
    [pendingInventoryIds],
  );

  const syncData = useCallback(async () => {
    if (
      document.hidden ||
      busyRef.current ||
      syncingRef.current ||
      invSavingRef.current
    ) {
      return;
    }
    syncingRef.current = true;
    try {
      const [inventory, rentalList] = await Promise.all([
        apiJson<InventoryItem[]>("/api/inventory"),
        apiJson<RentalRecord[]>("/api/rentals"),
      ]);
      applyServerData(inventory, rentalList);
    } catch (err) {
      console.warn("Background sync failed:", err);
    } finally {
      syncingRef.current = false;
    }
  }, [applyServerData]);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [inventory, rentalList] = await Promise.all([
        apiJson<InventoryItem[]>("/api/inventory"),
        apiJson<RentalRecord[]>("/api/rentals"),
      ]);
      applyServerData(inventory, rentalList, true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  }, [applyServerData]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  useEffect(() => {
    const interval = setInterval(() => void syncData(), SYNC_INTERVAL_MS);
    const onVisible = () => {
      if (!document.hidden) void syncData();
    };
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", onVisible);
    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", onVisible);
    };
  }, [syncData]);

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

  const invHasChanges = useMemo(() => {
    for (const item of inv) {
      const saved = invBaseline.get(item.id);
      if (saved && getDirtyFields(item, saved).length > 0) return true;
    }
    return false;
  }, [inv, invBaseline]);

  const saveAllInvChanges = useCallback(async () => {
    const byItem = new Map<number, InvEditableField[]>();
    for (const item of invRef.current) {
      const saved = invBaselineRef.current.get(item.id);
      if (!saved) continue;
      const fields = getDirtyFields(item, saved);
      if (fields.length > 0) byItem.set(item.id, fields);
    }
    if (byItem.size === 0) return;

    invSavingRef.current = true;
    setInvSaveState("saving");
    try {
      for (const [id, fields] of byItem) {
        let latest = invRef.current.find((i) => i.id === id);
        if (!latest) continue;

        for (const field of fields) {
          latest =
            field === "flag"
              ? await apiJson<InventoryItem>("/api/inventory", {
                  method: "PATCH",
                  body: JSON.stringify({ id, flagMode: getInvFlagMode(latest) }),
                })
              : await apiJson<InventoryItem>("/api/inventory", {
                  method: "PATCH",
                  body: JSON.stringify({ id, field, value: latest[field] }),
                });
        }

        setInv((iv) => iv.map((i) => (i.id === id ? latest! : i)));
        setInvBaseline((prev) => {
          const next = new Map(prev);
          next.set(id, { ...latest! });
          return next;
        });
        invRef.current = invRef.current.map((i) => (i.id === id ? latest! : i));
        invBaselineRef.current.set(id, { ...latest! });
      }
      setInvSaveState("saved");
      setInvEditing(false);
      if (savedTimerRef.current) clearTimeout(savedTimerRef.current);
      savedTimerRef.current = setTimeout(() => {
        setInvSaveState((s) => (s === "saved" ? "idle" : s));
      }, SAVED_MS);
    } catch (err) {
      setInvSaveState("error");
      void loadData();
      void showError(err);
      console.error(err);
    } finally {
      invSavingRef.current = false;
    }
  }, [loadData]);

  const discardAllInvChanges = useCallback(() => {
    setInv((current) =>
      current
        .map((item) => {
          const saved = invBaselineRef.current.get(item.id);
          return saved ? { ...saved } : item;
        })
        .sort(bySort),
    );
    if (savedTimerRef.current) clearTimeout(savedTimerRef.current);
    setInvSaveState("idle");
    setInvEditing(false);
  }, []);

  const startInvEditing = useCallback(() => {
    setInvEditing(true);
    if (savedTimerRef.current) clearTimeout(savedTimerRef.current);
    setInvSaveState("idle");
  }, []);

  function editStock(
    id: number,
    field: keyof InventoryItem,
    val: string | number | boolean,
  ) {
    const strFields: (keyof InventoryItem)[] = ["name", "cat"];
    const boolFields: (keyof InventoryItem)[] = ["noStand", "noFree", "isStand"];
    const nextVal = boolFields.includes(field)
      ? !!val
      : strFields.includes(field)
        ? val
        : +val || 0;

    setInv((iv) =>
      iv.map((i) => {
        if (i.id !== id) return i;
        const next = { ...i };
        if (boolFields.includes(field) && !nextVal) {
          delete next[field];
        } else {
          (next as Record<string, unknown>)[field] = nextVal;
        }
        return next;
      }),
    );
  }

  function editFlagMode(id: number, mode: InvFlagMode) {
    setInv((iv) =>
      iv.map((i) => (i.id === id ? applyFlagMode(i, mode) : i)),
    );
  }

  async function addItem(item: Omit<InventoryItem, "id">) {
    try {
      setBusy(true);
      const created = await apiJson<InventoryItem>("/api/inventory", {
        method: "POST",
        body: JSON.stringify(item),
      });
      setInv((iv) => [...iv, created].sort(bySort));
      setInvBaseline((prev) => {
        const next = new Map(prev);
        next.set(created.id, { ...created });
        return next;
      });
      return created;
    } catch (err) {
      void showError(err);
      console.error(err);
      throw err;
    } finally {
      setBusy(false);
    }
  }

  async function deleteItem(id: number) {
    const item = invRef.current.find((i) => i.id === id);
    if (!item) return;

    const outQty = outMap[id] || 0;
    if (outQty > 0) {
      void showAlert(
        `Идэвхтэй түрээст ${outQty} ширхэг байна. Эхлээд ирүүлнэ үү.`,
      );
      return;
    }

    if (
      !(await confirm({
        title: "Бараа устгах",
        message: `"${item.name}" устгах уу?\n\nЭнэ үйлдлийг буцаах боломжгүй.`,
        confirmLabel: "Устгах",
        danger: true,
      }))
    ) {
      return;
    }

    try {
      setBusy(true);
      await apiJson<{ ok: boolean }>("/api/inventory", {
        method: "DELETE",
        body: JSON.stringify({ id }),
      });
      setInv((iv) => iv.filter((i) => i.id !== id));
      setInvBaseline((prev) => {
        const next = new Map(prev);
        next.delete(id);
        return next;
      });
      invRef.current = invRef.current.filter((i) => i.id !== id);
      invBaselineRef.current.delete(id);
      setCart((c) => {
        if (!(id in c)) return c;
        const next = { ...c };
        delete next[id];
        return next;
      });
    } catch (err) {
      void showError(err);
      console.error(err);
    } finally {
      setBusy(false);
    }
  }

  async function checkout() {
    try {
      if (lines.length === 0) {
        void showAlert("Эхлээд бараа сонгоно уу.");
        return;
      }
      if (!cust.name || !cust.name.trim()) {
        void showAlert("Түрээслэгчийн нэрийг бөглөнө үү.");
        return;
      }
      if (freeShort > 0) {
        const ok = await confirm({
          title: "Анхаар",
          message: `${freeShort} үнэгүй стенд бэлэн байхгүй тул дагалдуулж чадсангүй (Combo stand үнэгүй биш). Үргэлжлүүлэх үү?`,
          confirmLabel: "Үргэлжлүүлэх",
        });
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
      void showError(err);
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
      void showError(err);
      console.error(err);
    } finally {
      setBusy(false);
    }
  }

  async function deleteRentalRecord(rid: string) {
    const rental = rentals.find((r) => r.id === rid);
    if (!rental) return;

    const message =
      rental.status === "out"
        ? `Идэвхтэй түрээс (${rental.cust.name}) устгах уу?\n\nБараа түрээслэгдсэн төлөвөөс гарах болно.`
        : `"${rental.cust.name}" түрээсийн бичлэгийг устгах уу?\n\nЭнэ үйлдлийг буцаах боломжгүй.`;

    if (
      !(await confirm({
        title: "Түрээс устгах",
        message,
        confirmLabel: "Устгах",
        danger: true,
      }))
    ) {
      return;
    }

    try {
      setBusy(true);
      await apiJson<{ ok: boolean }>(`/api/rentals/${rid}`, {
        method: "DELETE",
      });
      setRentals((rs) => rs.filter((r) => r.id !== rid));
    } catch (err) {
      void showError(err);
      console.error(err);
    } finally {
      setBusy(false);
    }
  }

  async function deleteAllRentals() {
    if (rentals.length === 0) return;

    const activeCount = rentals.filter((r) => r.status === "out").length;
    const activeNote =
      activeCount > 0
        ? `\n\n${activeCount} идэвхтэй түрээс байна — бараа түрээслэгдсэн төлөвөөс гарах болно.`
        : "";

    if (
      !(await confirm({
        title: "Бүгдийг устгах",
        message: `${rentals.length} түрээсийн бичлэгийг бүгдийг нь устгах уу?\n\nЭнэ үйлдлийг буцаах боломжгүй.${activeNote}`,
        confirmLabel: "Устгах",
        danger: true,
      }))
    ) {
      return;
    }

    try {
      setBusy(true);
      await apiJson<{ ok: boolean; deleted: number }>("/api/rentals", {
        method: "DELETE",
        body: JSON.stringify({ all: true }),
      });
      setRentals([]);
    } catch (err) {
      void showError(err);
      console.error(err);
    } finally {
      setBusy(false);
    }
  }

  const totalSku = inv.length;
  const activeR = rentals.filter((r) => r.status === "out").length;
  const filteredRentals = useMemo(() => {
    if (rentalFilter === "all") return rentals;
    return rentals.filter((r) => r.status === rentalFilter);
  }, [rentals, rentalFilter]);
  const filteredInv = inv
    .filter((i) => catFilter === "all" || i.cat === catFilter)
    .sort(bySort);

  const availableTotal = inv.reduce((s, i) => s + avail(i.id), 0);
  const outTotal = Object.values(outMap).reduce((s, n) => s + n, 0);

  const itemOutQty = useCallback(
    (id: number) => outMap[id] || 0,
    [outMap],
  );

  return {
    tab,
    setTab,
    inv,
    cart,
    days,
    setDays,
    rentals,
    rentalFilter,
    setRentalFilter,
    filteredRentals,
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
    invEditing,
    invHasChanges,
    invSaveState,
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
    itemOutQty,
    setQty,
    checkout,
    returnRental,
    deleteRental: deleteRentalRecord,
    deleteAllRentals,
    editStock,
    saveAllInvChanges,
    discardAllInvChanges,
    startInvEditing,
    editFlagMode,
    addItem,
    deleteItem,
    confirmState,
    alertState,
    showAlert,
  };
}

export type RentalAppState = ReturnType<typeof useRentalApp>;
