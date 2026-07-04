import { z } from "zod";
import type { Category, PriceMode, RentalHistoryFilter, Theme } from "./types";

const categorySchema = z.enum([
  "ГЭРЭЛ",
  "FIXTURE",
  "СТЕНД",
  "БАТТЕРЭЙ",
  "БУСАД",
]);

export const userSettingsSchema = z.object({
  theme: z.enum(["dark", "light"]).optional(),
  priceMode: z.enum(["base", "vat"]).optional(),
  catFilter: z.union([categorySchema, z.literal("all")]).optional(),
  rentalFilter: z.enum(["all", "out", "in"]).optional(),
});

export type UserSettings = z.infer<typeof userSettingsSchema>;

export type ResolvedUserSettings = {
  theme: Theme;
  priceMode: PriceMode;
  catFilter: Category | "all";
  rentalFilter: RentalHistoryFilter;
};

export const USER_SETTINGS_COOKIE = "lumo-lab-settings";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

const defaults: ResolvedUserSettings = {
  theme: "dark",
  priceMode: "base",
  catFilter: "all",
  rentalFilter: "all",
};

function parseCookieValue(raw: string | null): UserSettings {
  if (!raw) return {};
  try {
    const parsed = userSettingsSchema.safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data : {};
  } catch {
    return {};
  }
}

export function resolveUserSettings(
  stored: UserSettings = {},
): ResolvedUserSettings {
  return {
    theme: stored.theme ?? defaults.theme,
    priceMode: stored.priceMode ?? defaults.priceMode,
    catFilter: stored.catFilter ?? defaults.catFilter,
    rentalFilter: stored.rentalFilter ?? defaults.rentalFilter,
  };
}

export function readUserSettings(): UserSettings {
  if (typeof document === "undefined") return {};
  const match = document.cookie.match(
    new RegExp(`(?:^|; )${USER_SETTINGS_COOKIE}=([^;]*)`),
  );
  return parseCookieValue(match ? decodeURIComponent(match[1]) : null);
}

export function writeUserSettings(settings: UserSettings): void {
  if (typeof document === "undefined") return;
  const next = { ...readUserSettings(), ...settings };
  const value = encodeURIComponent(JSON.stringify(next));
  document.cookie = `${USER_SETTINGS_COOKIE}=${value}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`;
}

/** Runs before paint so the saved theme applies without a flash. */
export function getThemeInitScript(): string {
  return `(function(){try{var m=document.cookie.match(/(?:^|; )${USER_SETTINGS_COOKIE}=([^;]*)/);if(m){var s=JSON.parse(decodeURIComponent(m[1]));if(s.theme==="light"||s.theme==="dark")document.documentElement.setAttribute("data-theme",s.theme);}}catch(e){}})();`;
}
