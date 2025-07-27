// backend/src/db.ts
import { PrismaClient } from "./generated/prisma";
import { withAccelerate } from "@prisma/extension-accelerate";

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      DATABASE_URL: string;
    }
  }
}

// Configure PrismaClient with extended timeouts for Neon PostgreSQL
const prismaClientSingleton = () => {
  // Set environment variables for Prisma timeouts
  process.env.PRISMA_CLIENT_ENGINE_LIBRARY_ADVISORY_LOCK_TIMEOUT = "60000";

  // Create client with accelerate
  return new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  }).$extends(withAccelerate());
};

// Use a global singleton to avoid connection issues
const globalForPrisma = global as unknown as {
  prisma: ReturnType<typeof prismaClientSingleton>;
};
const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;
