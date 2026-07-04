import type { Theme } from "@/lib/rental/types";

type AppHeaderProps = {
  theme: Theme;
  onToggleTheme: () => void;
};

export function AppHeader({ theme, onToggleTheme }: AppHeaderProps) {
  return (
    <header>
      <div className="logo">
        <img
          src={theme === "light" ? "/logo-red.jpeg" : "/logo-white.jpeg"}
          alt="Lumo Lab"
          width={38}
          height={38}
        />
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
