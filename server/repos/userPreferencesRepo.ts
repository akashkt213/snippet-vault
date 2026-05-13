import { prisma } from "@/lib/db/prisma";
import type { UpdateUserPreferencesInput } from "@/lib/validators/userPreferences";

export async function getUserPreferences(userId: string) {
  return prisma.userPreferences.findUnique({
    where: { userId },
  });
}

export async function updateUserPreferences(
  userId: string,
  preferences: UpdateUserPreferencesInput,
) {
  return prisma.userPreferences.upsert({
    where: { userId },
    create: {
      userId,
      ...preferences,
    },
    update: preferences,
  });
}
