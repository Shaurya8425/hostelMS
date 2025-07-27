-- Update the data from boolean flags to counts
UPDATE "Student"
SET 
    "bedsheetCount" = CASE WHEN "bedsheetIssued" THEN 1 ELSE 0 END,
    "pillowCount" = CASE WHEN "pillowIssued" THEN 2 ELSE 0 END,
    "blanketCount" = CASE WHEN "blanketIssued" THEN 1 ELSE 0 END;

-- Drop the old boolean columns
ALTER TABLE "Student" DROP COLUMN "bedsheetIssued";
ALTER TABLE "Student" DROP COLUMN "pillowIssued";
ALTER TABLE "Student" DROP COLUMN "blanketIssued";
