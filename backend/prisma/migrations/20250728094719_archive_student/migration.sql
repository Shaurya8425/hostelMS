-- CreateTable
CREATE TABLE "ArchivedStudent" (
    "id" SERIAL NOT NULL,
    "originalId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "gender" "Gender" NOT NULL,
    "designation" TEXT,
    "guardianName" TEXT,
    "mobile" TEXT,
    "ticketNumber" TEXT,
    "division" TEXT,
    "course" TEXT,
    "fromDate" TIMESTAMP(3),
    "toDate" TIMESTAMP(3),
    "bedsheetCount" INTEGER NOT NULL DEFAULT 0,
    "pillowCount" INTEGER NOT NULL DEFAULT 0,
    "blanketCount" INTEGER NOT NULL DEFAULT 0,
    "linenIssuedDate" TIMESTAMP(3),
    "roomNumber" TEXT,
    "deletedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedBy" TEXT,
    "originalCreatedAt" TIMESTAMP(3) NOT NULL,
    "originalUpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ArchivedStudent_pkey" PRIMARY KEY ("id")
);
