-- This is a recovery migration to fix the previously failed migration
-- First, check if columns exist and create them if they don't
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

-- Check if old boolean columns exist and migrate data if they do
DO $$
BEGIN
    IF EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'Student' AND column_name = 'bedsheetIssued'
    ) THEN
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
    END IF;
END $$;
