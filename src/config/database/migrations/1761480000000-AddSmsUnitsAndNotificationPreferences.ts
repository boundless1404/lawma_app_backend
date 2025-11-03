import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSmsUnitsAndNotificationPreferences1761480000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add smsUnits column to entity_profile
    await queryRunner.query(`
            ALTER TABLE "entity_profile" 
            ADD COLUMN "smsUnits" integer NOT NULL DEFAULT 0
        `);

    // Add notification preference columns to entity_profile_preference
    await queryRunner.query(`
            ALTER TABLE "entity_profile_preference" 
            ADD COLUMN "enableSmsNotifications" boolean NOT NULL DEFAULT true
        `);

    await queryRunner.query(`
            ALTER TABLE "entity_profile_preference" 
            ADD COLUMN "enableEmailNotifications" boolean NOT NULL DEFAULT true
        `);

    // Update autoGenerateBills to boolean if it's not already
    await queryRunner.query(`
            ALTER TABLE "entity_profile_preference" 
            ALTER COLUMN "autoGenerateBills" TYPE boolean USING "autoGenerateBills"::boolean
        `);

    await queryRunner.query(`
            ALTER TABLE "entity_profile_preference" 
            ALTER COLUMN "autoGenerateBills" SET DEFAULT false
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove columns from entity_profile_preference
    await queryRunner.query(`
            ALTER TABLE "entity_profile_preference" 
            DROP COLUMN IF EXISTS "enableEmailNotifications"
        `);

    await queryRunner.query(`
            ALTER TABLE "entity_profile_preference" 
            DROP COLUMN IF EXISTS "enableSmsNotifications"
        `);

    // Remove column from entity_profile
    await queryRunner.query(`
            ALTER TABLE "entity_profile" 
            DROP COLUMN IF EXISTS "smsUnits"
        `);
  }
}
