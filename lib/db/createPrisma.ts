import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";

/**
 * Prisma 7+ requires a driver adapter (e.g. `@prisma/adapter-pg`) or Prisma Accelerate.
 * URL for `prisma migrate` / Studio lives in `prisma.config.ts`.
 */
export function createPrismaClient() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL must be set to use Prisma with the Postgres adapter.");
  }

  const pool = new Pool({ connectionString: url });
  const adapter = new PrismaPg(pool);

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["query", "warn", "error"] : ["error"],
  });
}
