import { getUserPreferences, updateUserPreferences } from "../repos/userPreferencesRepo";
import type { UpdateUserPreferencesInput } from "@/lib/validators/userPreferences";

export async function getUserPreferencesService(userId: string) {
  return getUserPreferences(userId);
}

export async function updateUserPreferencesService(
  userId: string,
  preferences: UpdateUserPreferencesInput,
) {
  return updateUserPreferences(userId, preferences);
}