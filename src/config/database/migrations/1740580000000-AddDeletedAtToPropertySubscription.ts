import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddDeletedAtToPropertySubscription1740580000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE property_subscription 
      ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP WITH TIME ZONE
    `);

    // Create index for better query performance
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_property_subscription_deleted_at" 
      ON property_subscription ("deletedAt")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP INDEX IF EXISTS "IDX_property_subscription_deleted_at"
    `);

    await queryRunner.query(`
      ALTER TABLE property_subscription 
      DROP COLUMN IF EXISTS "deletedAt"
    `);
  }
}
