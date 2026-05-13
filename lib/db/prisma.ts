import { createPrismaClient } from "@/lib/db/createPrisma";

type AppPrismaClient = Awaited<ReturnType<typeof createPrismaClient>>;

declare global {
  var __prisma: AppPrismaClient | undefined;
}

/** Dev HMR can keep a Prisma singleton from before `prisma generate`; that client has no new delegates. */
function prismaHasCurrentModels(client: unknown): client is AppPrismaClient {
  if (typeof client !== "object" || client === null) return false;
  const delegate = (client as { userPreferences?: { findUnique?: unknown } })
    .userPreferences;
  return typeof delegate?.findUnique === "function";
}

const cached = globalThis.__prisma;
const prismaInstance =
  cached && prismaHasCurrentModels(cached)
    ? cached
    : await createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalThis.__prisma = prismaInstance;
}

export const prisma: AppPrismaClient = prismaInstance;
