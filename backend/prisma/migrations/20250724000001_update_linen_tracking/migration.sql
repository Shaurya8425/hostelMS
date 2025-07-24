-- Update LinenInventory table
ALTER TABLE "LinenInventory" 
ADD COLUMN "bedsheetActive" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "bedsheetInHand" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "pillowActive" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "pillowInHand" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "blanket" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "blanketActive" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "blanketInHand" INTEGER NOT NULL DEFAULT 0;

-- Update Student table
ALTER TABLE "Student"
ADD COLUMN "bedsheetIssued" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "pillowIssued" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "blanketIssued" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "linenIssuedDate" TIMESTAMP;

-- Migrate existing data
UPDATE "Student"
SET 
  "bedsheetIssued" = CASE WHEN "linenIssued" = 'BEDSHEET' OR "linenIssued" = 'Y' THEN true ELSE false END,
  "pillowIssued" = CASE WHEN "linenIssued" = 'PILLOW_COVER' OR "linenIssued" = 'Y' THEN true ELSE false END,
  "linenIssuedDate" = CASE WHEN "linenIssued" IS NOT NULL THEN CURRENT_TIMESTAMP ELSE NULL END;
