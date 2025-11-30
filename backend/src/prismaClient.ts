import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";

declare global {
  // Allow global prisma in development to prevent hot-reload multiple clients
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

// Prisma 7+ requires using a database adapter
const connectionString =
  process.env.DATABASE_URL ||
  "postgresql://postgres:postgres@localhost:5432/advancia";
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

const prisma =
  global.__prisma ??
  new PrismaClient({
    adapter,
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  global.__prisma = prisma;
}

export default prisma;
export type { PrismaClient };

// CommonJS compatibility for JavaScript files
module.exports = prisma;
module.exports.default = prisma;
