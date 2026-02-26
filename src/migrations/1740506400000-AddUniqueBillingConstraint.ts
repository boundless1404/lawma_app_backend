import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUniqueBillingConstraint1740506400000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Step 1: Mark duplicate billings (keep the oldest, mark others for reference)
    // We'll add a comment to duplicates but NOT delete them to preserve financial records
    await queryRunner.query(`
      -- Add a column to track if this is a duplicate (for reporting only)
      ALTER TABLE "billing" 
      ADD COLUMN IF NOT EXISTS "is_duplicate" BOOLEAN DEFAULT FALSE;
    `);

    // Step 2: Mark duplicates (keep the first created, mark rest as duplicates)
    await queryRunner.query(`
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
    `);

    // Step 3: Add unique partial index (only for non-duplicates)
    // This allows existing duplicates to remain but prevents new ones
    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "idx_unique_billing_per_property_month_year"
      ON "billing" ("propertySubscriptionId", month, year)
      WHERE "is_duplicate" = FALSE OR "is_duplicate" IS NULL;
    `);

    // Log the number of duplicates found
    await queryRunner.query(`
      DO $$
      DECLARE
        duplicate_count INTEGER;
      BEGIN
        SELECT COUNT(*) INTO duplicate_count
        FROM billing
        WHERE "is_duplicate" = TRUE;
        
        RAISE NOTICE 'Marked % duplicate billing records', duplicate_count;
      END $$;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove the unique index
    await queryRunner.query(`
      DROP INDEX IF EXISTS "idx_unique_billing_per_property_month_year";
    `);

    // Remove the is_duplicate column
    await queryRunner.query(`
      ALTER TABLE "billing" DROP COLUMN IF EXISTS "is_duplicate";
    `);
  }
}
