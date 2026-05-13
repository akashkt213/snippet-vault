import type { UserPreferences } from "@/lib/validators/userPreferences";

export type AppThemeMode = "light" | "dark";

export function resolveAppTheme(
  theme: UserPreferences["theme"],
  prefersDark: boolean,
): AppThemeMode {
  if (theme === "system") {
    return prefersDark ? "dark" : "light";
  }
  return theme === "light" ? "light" : "dark";
}
