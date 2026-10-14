// src/lib/clients/prisma-client.ts
import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

/* -------------------------------------------------------------------------- */
/*  Prisma Client — AWS RDS PostgreSQL                                         */
/* -------------------------------------------------------------------------- */

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not set in environment variables.");
}

const adapter = new PrismaPg({
  connectionString,
  // AWS RDS uses its own CA — trust it via rejectUnauthorized: false.
  // Connection remains encrypted (SSL/TLS).
  ssl: {
    rejectUnauthorized: false,
  },
});

const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;