import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddBillingActiveColumn1740572000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add isBillingActive column to property_subscription table
    await queryRunner.query(`
      ALTER TABLE "property_subscription" 
      ADD COLUMN IF NOT EXISTS "isBillingActive" BOOLEAN DEFAULT TRUE;
    `);

    // Ensure all existing subscriptions have billing active by default
    await queryRunner.query(`
      UPDATE "property_subscription"
      SET "isBillingActive" = TRUE
      WHERE "isBillingActive" IS NULL;
    `);

    // Log the change
    await queryRunner.query(`
      DO $$
      DECLARE
        total_count INTEGER;
      BEGIN
        SELECT COUNT(*) INTO total_count
        FROM "property_subscription";
        
        RAISE NOTICE 'Added isBillingActive column to % property subscriptions', total_count;
      END $$;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove the isBillingActive column
    await queryRunner.query(`
      ALTER TABLE "property_subscription" 
      DROP COLUMN IF EXISTS "isBillingActive";
    `);
  }
}
