// backend/src/db.ts
import { PrismaClient } from './generated/prisma';
import { withAccelerate } from '@prisma/extension-accelerate';

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      DATABASE_URL: string;
    }
  }
}

const prisma = new PrismaClient().$extends(withAccelerate());

export default prisma;
