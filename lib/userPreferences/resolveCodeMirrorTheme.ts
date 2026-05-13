import type { UserPreferences } from "@/lib/validators/userPreferences";

export type CodeMirrorUiTheme = "light" | "dark";

export function resolveCodeMirrorTheme(
  theme: UserPreferences["theme"],
  prefersDark: boolean,
): CodeMirrorUiTheme {
  if (theme === "system") {
    return prefersDark ? "dark" : "light";
  }
  return theme === "light" ? "light" : "dark";
}
