import { PrismaClient } from "@prisma/client";

import { createPrismaClient } from "@/lib/db/createPrisma";

declare global {
  var __prisma: PrismaClient | undefined;
}

export const prisma = globalThis.__prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalThis.__prisma = prisma;
}
