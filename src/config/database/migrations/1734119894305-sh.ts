import { MigrationInterface, QueryRunner } from "typeorm";

export class Sh1734119894305 implements MigrationInterface {
    name = 'Sh1734119894305'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "virtual_account_received_payment" ADD "virtualAccountDetailId" bigint NOT NULL`);
        await queryRunner.query(`ALTER TABLE "virtual_account_received_payment" ADD CONSTRAINT "FK_0d8ca8ccbeb4489623bb60bf6ce" FOREIGN KEY ("virtualAccountDetailId") REFERENCES "virtual_account_detail"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "virtual_account_received_payment" DROP CONSTRAINT "FK_0d8ca8ccbeb4489623bb60bf6ce"`);
        await queryRunner.query(`ALTER TABLE "virtual_account_received_payment" DROP COLUMN "virtualAccountDetailId"`);
    }

}
