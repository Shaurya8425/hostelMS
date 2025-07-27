import { PrismaClient } from "@prisma/client";

/**
 * Configure Prisma Client for use with Neon PostgreSQL
 * - Extends connection timeout to 60 seconds
 * - Sets advisory lock timeout to 60 seconds
 */
const prismaClientSingleton = () => {
  return new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
    // Longer connection timeout for Neon
    connectionTimeout: 60000,
    // Longer query timeout for migrations
    queryEngineConfig: {
      advisoryLockTimeout: 60000,
    },
  });
};

// Global type for TypeScript
declare global {
  var prisma: ReturnType<typeof prismaClientSingleton> | undefined;
}

// Export a global singleton instance to avoid multiple client instances
const prisma = global.prisma || prismaClientSingleton();

if (process.env.NODE_ENV !== "production") global.prisma = prisma;

export default prisma;
