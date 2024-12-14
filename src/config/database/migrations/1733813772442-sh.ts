import { MigrationInterface, QueryRunner } from "typeorm";

export class Sh1733813772442 implements MigrationInterface {
    name = 'Sh1733813772442'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "virtual_account_detail" ADD "email" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "virtual_account_detail" ALTER COLUMN "account_number" SET DEFAULT ''`);
        await queryRunner.query(`ALTER TABLE "virtual_account_detail" ALTER COLUMN "account_name" SET DEFAULT ''`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "virtual_account_detail" ALTER COLUMN "account_name" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "virtual_account_detail" ALTER COLUMN "account_number" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "virtual_account_detail" DROP COLUMN "email"`);
    }

}
