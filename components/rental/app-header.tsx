import { LumoMark } from "@/components/rental/icons";
import type { Theme } from "@/lib/rental/types";

type AppHeaderProps = {
  theme: Theme;
  onToggleTheme: () => void;
};

export function AppHeader({ theme, onToggleTheme }: AppHeaderProps) {
  return (
    <header>
      <div className="logo">
        <LumoMark size={24} />
      </div>
      <div className="header-text">
        <h1>Lumo Lab — Түрээсийн систем</h1>
        <div className="sub">Бараа материал · үнэ тооцоолол · түрээсийн гэрээ</div>
      </div>
      <button
        type="button"
        className="theme-btn"
        title={theme === "dark" ? "Гэрэлтэй горим" : "Харанхуй горим"}
        onClick={onToggleTheme}
        aria-label={theme === "dark" ? "Гэрэлтэй горим" : "Харанхуй горим"}
      >
        {theme === "dark" ? "☀" : "☾"}
      </button>
    </header>
  );
}
