/*
  Warnings:

  - You are about to drop the column `linenIssued` on the `Student` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Student" DROP COLUMN "linenIssued",
ALTER COLUMN "linenIssuedDate" SET DATA TYPE TIMESTAMP(3);
