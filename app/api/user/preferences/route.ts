import { requireAuthenticatedUser } from "@/lib/auth/requireUser";
import { updateUserPreferencesSchema } from "@/lib/validators/userPreferences";
import { getUserPreferencesService, updateUserPreferencesService } from "@/server/services/userPreferencesService";

export async function GET() {
  const user = await requireAuthenticatedUser();

  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const preferences = await getUserPreferencesService(user.id);
  return Response.json({ data: preferences });
}

export async function PATCH(request: Request) {
  const user = await requireAuthenticatedUser();

  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const json = await request.json();
  const parsed = updateUserPreferencesSchema.safeParse(json);

  if (!parsed.success) {
    return Response.json(
      { error: "Invalid preferences payload", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const preferences = await updateUserPreferencesService(user.id, parsed.data);
  return Response.json({ data: preferences });
}