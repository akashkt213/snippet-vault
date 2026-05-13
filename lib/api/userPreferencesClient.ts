import { apiClient } from "@/lib/api/client";
import {
  normalizeUserPreferencesFromStorage,
  type UserPreferences,
} from "@/lib/validators/userPreferences";

export async function fetchUserPreferences(): Promise<UserPreferences> {
  const json = await apiClient.get<{ data: unknown }>("/api/user/preferences", {
    timeoutMs: 12_000,
    retries: 2,
  });
  return normalizeUserPreferencesFromStorage(json.data);
}
