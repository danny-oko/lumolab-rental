import type { TabId } from "@/lib/rental/types";

type TabNavProps = {
  tab: TabId;
  cartCount: number;
  onTabChange: (tab: TabId) => void;
};

const tabs: { id: TabId; label: string }[] = [
  { id: "inv", label: "📦 Бараа материал" },
  { id: "rent", label: "🧾 Шинэ түрээс" },
  { id: "active", label: "🚚 Идэвхтэй / Түүх" },
];

export function TabNav({ tab, cartCount, onTabChange }: TabNavProps) {
  return (
    <nav className="tabs" role="tablist" aria-label="Үндсэн цэс">
      {tabs.map(({ id, label }) => (
        <button
          key={id}
          type="button"
          role="tab"
          aria-selected={tab === id}
          className={"tab" + (tab === id ? " on" : "")}
          onClick={() => onTabChange(id)}
        >
          {label}
          {id === "rent" && cartCount > 0 && (
            <span className="badge">{cartCount}</span>
          )}
        </button>
      ))}
    </nav>
  );
}
