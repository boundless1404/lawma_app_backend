import { MigrationInterface, QueryRunner } from "typeorm";

export class Sh1752071017371 implements MigrationInterface {
    name = 'Sh1752071017371'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "billing" ADD "createdAt" TIMESTAMP NOT NULL DEFAULT now()`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "billing" DROP COLUMN "createdAt"`);
    }

}
