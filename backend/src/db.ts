// backend/src/db.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.ACCELERATE_URL, // Use Prisma Accelerate proxy
    },
  },
});

export default prisma;
