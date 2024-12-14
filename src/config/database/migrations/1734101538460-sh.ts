import { MigrationInterface, QueryRunner } from "typeorm";

export class Sh1734101538460 implements MigrationInterface {
    name = 'Sh1734101538460'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "entity_profile_bank_account_details" ADD "bankName" character varying NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "entity_profile_bank_account_details" DROP COLUMN "bankName"`);
    }

}
