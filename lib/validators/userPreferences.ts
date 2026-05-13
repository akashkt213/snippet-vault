import { z } from "zod";

export const userPreferencesSchema = z.object({
  theme: z.enum(["light", "dark", "system"]).default("light"),
  accentDensity: z.enum(["compact", "comfortable"]).default("comfortable"),
  editorFontSize: z.number().int().min(11).max(20).default(13),
  tabSize: z.number().int().min(2).max(8).default(2),
  wordWrap: z.boolean().default(true),
  showLineNumbers: z.boolean().default(true),
});

export type UserPreferences = z.infer<typeof userPreferencesSchema>;

export const updateUserPreferencesSchema = userPreferencesSchema
  .partial()
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one field is required.",
  });

export type UpdateUserPreferencesInput = z.infer<typeof updateUserPreferencesSchema>;

/** Coerce API / DB row (or null) into a full `UserPreferences` object with schema defaults. */
export function normalizeUserPreferencesFromStorage(
  raw: unknown,
): UserPreferences {
  const defaults = userPreferencesSchema.parse({});
  if (!raw || typeof raw !== "object") return defaults;

  const r = raw as Record<string, unknown>;
  const candidate = {
    theme: r.theme,
    accentDensity: r.accentDensity,
    editorFontSize: r.editorFontSize,
    tabSize: r.tabSize,
    wordWrap: r.wordWrap,
    showLineNumbers: r.showLineNumbers,
  };

  const parsed = userPreferencesSchema.safeParse(candidate);
  return parsed.success ? parsed.data : defaults;
}