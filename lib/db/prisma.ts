import { createPrismaClient } from "@/lib/db/createPrisma";

type AppPrismaClient = Awaited<ReturnType<typeof createPrismaClient>>;

declare global {
  var __prisma: AppPrismaClient | undefined;
}

export const prisma: AppPrismaClient = globalThis.__prisma ?? (await createPrismaClient());

if (process.env.NODE_ENV !== "production") {
  globalThis.__prisma = prisma;
}
