-- AlterEnum
ALTER TYPE "LinenStatus" ADD VALUE 'Y';

-- CreateTable
CREATE TABLE "LinenInventory" (
    "id" SERIAL NOT NULL,
    "bedsheet" INTEGER NOT NULL DEFAULT 0,
    "pillowCover" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LinenInventory_pkey" PRIMARY KEY ("id")
);
