import { prisma } from "@/lib/db/prisma";
import type { UpdateUserPreferencesInput } from "@/lib/validators/userPreferences";

const userPreferencesDelegate = (
  prisma as unknown as {
    userPreferences: {
      findUnique: (args: { where: { userId: string } }) => Promise<unknown>;
      upsert: (args: {
        where: { userId: string };
        create: { userId: string } & UpdateUserPreferencesInput;
        update: UpdateUserPreferencesInput;
      }) => Promise<unknown>;
    };
  }
).userPreferences;

export async function getUserPreferences(userId: string) {
  return userPreferencesDelegate.findUnique({
    where: { userId },
  });
}

export async function updateUserPreferences(
  userId: string,
  preferences: UpdateUserPreferencesInput,
) {
  return userPreferencesDelegate.upsert({
    where: { userId },
    create: {
      userId,
      ...preferences,
    },
    update: preferences,
  });
}