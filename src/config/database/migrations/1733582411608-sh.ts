import { MigrationInterface, QueryRunner } from "typeorm";

export class Sh1733582411608 implements MigrationInterface {
    name = 'Sh1733582411608'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "virtual_account_detail" ("id" BIGSERIAL NOT NULL, "account_number" character varying NOT NULL, "account_name" character varying NOT NULL, "bank" character varying NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "propertySubscriptionId" bigint, "entityProfileId" bigint, CONSTRAINT "PK_a91bea692ecb0b7ddb0588a999a" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "virtual_account_detail" ADD CONSTRAINT "FK_e45ae4da43d23d80e0b9643bb65" FOREIGN KEY ("propertySubscriptionId") REFERENCES "property_subscription"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "virtual_account_detail" ADD CONSTRAINT "FK_490c18cfbc421e5031f24c1d392" FOREIGN KEY ("entityProfileId") REFERENCES "entity_profile"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "virtual_account_detail" DROP CONSTRAINT "FK_490c18cfbc421e5031f24c1d392"`);
        await queryRunner.query(`ALTER TABLE "virtual_account_detail" DROP CONSTRAINT "FK_e45ae4da43d23d80e0b9643bb65"`);
        await queryRunner.query(`DROP TABLE "virtual_account_detail"`);
    }

}
