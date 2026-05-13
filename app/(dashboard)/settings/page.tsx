import { redirect } from "next/navigation";

import SettingsForm from "@/components/settings/SettingsForm";
import { getAuthenticatedUser } from "@/lib/auth/session";
import { normalizeUserPreferencesFromStorage } from "@/lib/validators/userPreferences";
import { getUserPreferencesService } from "@/server/services/userPreferencesService";

export default async function SettingsPage() {
  const user = await getAuthenticatedUser();

  if (!user) {
    redirect("/login");
  }

  const row = await getUserPreferencesService(user.id);
  const initialPreferences = normalizeUserPreferencesFromStorage(row);

  return <SettingsForm initialPreferences={initialPreferences} />;
}
