/*
  Warnings:

  - Added the required column `floor` to the `Room` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "RoomStatus" AS ENUM ('AVAILABLE', 'OCCUPIED', 'RESERVED', 'BLOCKED');

-- AlterTable
ALTER TABLE "Room" ADD COLUMN     "designation" TEXT,
ADD COLUMN     "floor" INTEGER NOT NULL,
ADD COLUMN     "status" "RoomStatus" NOT NULL DEFAULT 'AVAILABLE';
