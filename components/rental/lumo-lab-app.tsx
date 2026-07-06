"use client";

import { ActiveRentalsPanel } from "@/components/rental/active-rentals-panel";
import { AppHeader } from "@/components/rental/app-header";
import { AlertDialog } from "@/components/rental/alert-dialog";
import { ConfirmDialog } from "@/components/rental/confirm-dialog";
import { CategoryProvider } from "@/components/rental/category-context";
import { InventoryPanel } from "@/components/rental/inventory-panel";
import { RentalPanel } from "@/components/rental/rental-panel";
import { StatsBar } from "@/components/rental/stats-bar";
import { TabNav } from "@/components/rental/tab-nav";
import { useRentalApp } from "@/components/rental/use-rental-app";

export function LumoLabApp() {
  const app = useRentalApp();

  if (app.loading) {
    return (
      <div className="lumo-app">
        <div className="empty-state">Өгөгдөл ачаалж байна…</div>
      </div>
    );
  }

  if (app.error) {
    return (
      <div className="lumo-app">
        <div className="empty-state">
          <p>Өгөгдөл ачаалахад алдаа гарлаа: {app.error}</p>
          <button type="button" className="btn" onClick={() => void app.reload()}>
            Дахин оролдох
          </button>
        </div>
      </div>
    );
  }

  return (
    <CategoryProvider categories={app.categories}>
      <div className="lumo-app">
        {app.confirmState && <ConfirmDialog {...app.confirmState} />}
        {app.alertState && <AlertDialog {...app.alertState} />}
        <AppHeader
          theme={app.theme}
          onToggleTheme={() =>
            app.setTheme((t) => (t === "dark" ? "light" : "dark"))
          }
        />

        <StatsBar
          totalSku={app.totalSku}
          availableTotal={app.availableTotal}
          outTotal={app.outTotal}
          activeRentals={app.activeR}
          standsAvail={app.standsAvail}
        />

        <div className="tab-shell">
          <TabNav
            tab={app.tab}
            cartCount={app.cartCount}
            onTabChange={app.setTab}
          />

          <main className="main-content">
            {app.tab === "inv" && (
              <InventoryPanel
                inv={app.inv}
                filteredInv={app.filteredInv}
                catFilter={app.catFilter}
                avail={app.avail}
                busy={app.busy}
                invEditing={app.invEditing}
                invHasChanges={app.invHasChanges}
                invSaveState={app.invSaveState}
                onFilterChange={app.setCatFilter}
                onStartEditing={app.startInvEditing}
                onEditStock={app.editStock}
                onSaveAll={() => void app.saveAllInvChanges()}
                onDiscardAll={app.discardAllInvChanges}
                onEditFlagMode={app.editFlagMode}
                onAddItem={app.addItem}
                onAddCategory={app.addCategory}
                onReorderCategories={(cats) => void app.reorderCategories(cats)}
                onReorderInventory={(items) => void app.reorderInventory(items)}
                onDeleteItem={(id) => void app.deleteItem(id)}
                onAlert={app.showAlert}
                itemOutQty={app.itemOutQty}
              />
            )}

            {app.tab === "rent" && <RentalPanel {...app} />}

            {app.tab === "active" && (
              <ActiveRentalsPanel
                rentals={app.rentals}
                filteredRentals={app.filteredRentals}
                rentalFilter={app.rentalFilter}
                busy={app.busy}
                onFilterChange={app.setRentalFilter}
                onReturn={app.returnRental}
                onDeleteRental={(id) => void app.deleteRental(id)}
                onDeleteAllRentals={() => void app.deleteAllRentals()}
              />
            )}
          </main>
        </div>
      </div>
    </CategoryProvider>
  );
}
