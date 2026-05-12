import { promises as dns } from "node:dns";

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";

/**
 * Prisma 7+ requires a driver adapter (e.g. `@prisma/adapter-pg`) or Prisma Accelerate.
 * URL for `prisma migrate` / Studio lives in `prisma.config.ts`.
 */
async function createDatabasePool(urlString: string) {
  const url = new URL(urlString);
  const { address } = await dns.lookup(url.hostname, { family: 4, all: false });

  return new Pool({
    host: address,
    port: Number(url.port || 5432),
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database: url.pathname.replace(/^\//, ""),
    ssl: {
      rejectUnauthorized: true,
      servername: url.hostname,
    },
    connectionTimeoutMillis: 15_000,
  });
}

export async function createPrismaClient() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL must be set to use Prisma with the Postgres adapter.");
  }

  const pool = await createDatabasePool(url);
  const adapter = new PrismaPg(pool);

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["query", "warn", "error"] : ["error"],
  });
}
