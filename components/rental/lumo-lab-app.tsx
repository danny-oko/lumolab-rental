"use client";

import { ActiveRentalsPanel } from "@/components/rental/active-rentals-panel";
import { AppHeader } from "@/components/rental/app-header";
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
    <div className="lumo-app">
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
            onFilterChange={app.setCatFilter}
            onEditStock={app.editStock}
          />
        )}

        {app.tab === "rent" && <RentalPanel {...app} />}

        {app.tab === "active" && (
          <ActiveRentalsPanel
            rentals={app.rentals}
            onReturn={app.returnRental}
          />
        )}
      </main>
    </div>
  );
}
