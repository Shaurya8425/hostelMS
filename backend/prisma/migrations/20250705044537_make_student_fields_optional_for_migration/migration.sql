-- CreateEnum
CREATE TYPE "LinenStatus" AS ENUM ('Y', 'NA');

-- AlterTable
ALTER TABLE "Student" ADD COLUMN     "course" TEXT,
ADD COLUMN     "division" TEXT,
ADD COLUMN     "fromDate" TIMESTAMP(3),
ADD COLUMN     "linenIssued" "LinenStatus",
ADD COLUMN     "toDate" TIMESTAMP(3);
