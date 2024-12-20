import { MigrationInterface, QueryRunner } from "typeorm";

export class Sh1734115045962 implements MigrationInterface {
    name = 'Sh1734115045962'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "virtual_account_received_payment" ("id" BIGSERIAL NOT NULL, "paymentReference" character varying NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "entityProfileId" bigint NOT NULL, CONSTRAINT "PK_6ea110c7d4a548dd1b78f5a6af1" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "virtual_account_received_payment" ADD CONSTRAINT "FK_a09dc61708f6292c2b7e7cdee77" FOREIGN KEY ("entityProfileId") REFERENCES "entity_profile"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "virtual_account_received_payment" DROP CONSTRAINT "FK_a09dc61708f6292c2b7e7cdee77"`);
        await queryRunner.query(`DROP TABLE "virtual_account_received_payment"`);
    }

}
