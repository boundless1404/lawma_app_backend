import { MigrationInterface, QueryRunner } from "typeorm";

export class Sh1734100482274 implements MigrationInterface {
    name = 'Sh1734100482274'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "entity_profile_bank_account_details" ("entityProfileId" bigint NOT NULL, "accountName" character varying NOT NULL, "accountNumber" character varying NOT NULL, "bankCode" character varying NOT NULL, "currency" character varying NOT NULL DEFAULT 'NGN', CONSTRAINT "PK_3240b95a08da9c4a0d50e557ff7" PRIMARY KEY ("entityProfileId"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "entity_profile_bank_account_details"`);
    }

}
