import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // process.env (not env()) so `prisma generate` works on CI before DATABASE_URL is set
    url: process.env.DATABASE_URL,
  },
});
