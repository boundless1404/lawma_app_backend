-- Step 1: Add is_duplicate column
ALTER TABLE "billing" ADD COLUMN IF NOT EXISTS "is_duplicate" BOOLEAN DEFAULT FALSE;

-- Step 2: Mark duplicates (keep the first created, mark rest as duplicates)
WITH ranked_billings AS (
  SELECT 
    id,
    ROW_NUMBER() OVER (
      PARTITION BY "propertySubscriptionId", month, year 
      ORDER BY "createdAt" ASC, id ASC
    ) as rn
  FROM billing
)
UPDATE billing
SET "is_duplicate" = TRUE
WHERE id IN (
  SELECT id FROM ranked_billings WHERE rn > 1
);

-- Step 3: Add unique partial index
CREATE UNIQUE INDEX IF NOT EXISTS "idx_unique_billing_per_property_month_year"
ON "billing" ("propertySubscriptionId", month, year)
WHERE "is_duplicate" = FALSE OR "is_duplicate" IS NULL;

-- Step 4: Show count of duplicates marked
SELECT COUNT(*) as duplicate_count
FROM billing
WHERE "is_duplicate" = TRUE;
