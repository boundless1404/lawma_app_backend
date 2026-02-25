import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPreviousArrearsToBilling1740571000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add previousArrears column to billing table for audit tracking
    await queryRunner.query(`
      ALTER TABLE "billing" 
      ADD COLUMN IF NOT EXISTS "previousArrears" NUMERIC(10, 2) NULL;
    `);

    // Log the change
    await queryRunner.query(`
      DO $$
      DECLARE
        total_count INTEGER;
      BEGIN
        SELECT COUNT(*) INTO total_count
        FROM "billing";
        
        RAISE NOTICE 'Added previousArrears column to % billing records for audit tracking', total_count;
      END $$;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove the previousArrears column
    await queryRunner.query(`
      ALTER TABLE "billing" 
      DROP COLUMN IF EXISTS "previousArrears";
    `);
  }
}
