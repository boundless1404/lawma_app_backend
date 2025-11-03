import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddDashboardToPermissionCategory1730024400000
  implements MigrationInterface
{
  name = 'AddDashboardToPermissionCategory1730024400000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add 'dashboard' to the permission_category_enum
    await queryRunner.query(`
      ALTER TYPE "public"."permission_category_enum" 
      ADD VALUE IF NOT EXISTS 'dashboard'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Note: PostgreSQL doesn't support removing enum values easily
    // You would need to recreate the enum type and update all references
    // For now, we'll leave this empty as removing enum values is complex
    console.log(
      'Removing enum values is not supported. Manual intervention required.',
    );
  }
}
