-- First add the new columns if they don't exist
DO $$ 
BEGIN 
    BEGIN
        ALTER TABLE "Student" ADD COLUMN "bedsheetCount" INTEGER NOT NULL DEFAULT 0;
    EXCEPTION
        WHEN duplicate_column THEN NULL;
    END;
    BEGIN
        ALTER TABLE "Student" ADD COLUMN "pillowCount" INTEGER NOT NULL DEFAULT 0;
    EXCEPTION
        WHEN duplicate_column THEN NULL;
    END;
    BEGIN
        ALTER TABLE "Student" ADD COLUMN "blanketCount" INTEGER NOT NULL DEFAULT 0;
    EXCEPTION
        WHEN duplicate_column THEN NULL;
    END;
END $$;

-- Update the data from boolean flags to counts
UPDATE "Student"
SET 
    "bedsheetCount" = CASE WHEN "bedsheetIssued" THEN 1 ELSE 0 END,
    "pillowCount" = CASE WHEN "pillowIssued" THEN 2 ELSE 0 END,
    "blanketCount" = CASE WHEN "blanketIssued" THEN 1 ELSE 0 END;

-- Drop the old boolean columns
ALTER TABLE "Student" DROP COLUMN IF EXISTS "bedsheetIssued";
ALTER TABLE "Student" DROP COLUMN IF EXISTS "pillowIssued";
ALTER TABLE "Student" DROP COLUMN IF EXISTS "blanketIssued";
