import { MigrationInterface, QueryRunner } from "typeorm"

export class FixRoleUniqueConstraint1761478443623 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Drop the existing unique constraint on role.name
        await queryRunner.query(`ALTER TABLE "role" DROP CONSTRAINT IF EXISTS "UQ_role_name"`);
        
        // Add a composite unique constraint on (name, entityProfileId)
        await queryRunner.query(`ALTER TABLE "role" ADD CONSTRAINT "UQ_role_name_entity" UNIQUE ("name", "entityProfileId")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Remove the composite unique constraint
        await queryRunner.query(`ALTER TABLE "role" DROP CONSTRAINT IF EXISTS "UQ_role_name_entity"`);
        
        // Restore the original unique constraint on name
        await queryRunner.query(`ALTER TABLE "role" ADD CONSTRAINT "UQ_role_name" UNIQUE ("name")`);
    }

}
