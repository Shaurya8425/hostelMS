-- AlterTable
ALTER TABLE "Student"
ALTER COLUMN "bedsheetCount" SET DEFAULT 0,
ALTER COLUMN "pillowCount" SET DEFAULT 0,
ALTER COLUMN "blanketCount" SET DEFAULT 0;

-- Update existing data to set counts based on boolean flags
UPDATE "Student"
SET 
    "bedsheetCount" = CASE WHEN "bedsheetIssued" THEN 1 ELSE 0 END,
    "pillowCount" = CASE WHEN "pillowIssued" THEN 2 ELSE 0 END,
    "blanketCount" = CASE WHEN "blanketIssued" THEN 1 ELSE 0 END;

-- Drop old boolean columns
ALTER TABLE "Student" DROP COLUMN IF EXISTS "bedsheetIssued";
ALTER TABLE "Student" DROP COLUMN IF EXISTS "pillowIssued";
ALTER TABLE "Student" DROP COLUMN IF EXISTS "blanketIssued";
