import { MigrationInterface, QueryRunner } from "typeorm";

export class Sh1734109452134 implements MigrationInterface {
    name = 'Sh1734109452134'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."payment_transfer_status_enum" AS ENUM('pending', 'successful', 'failed')`);
        await queryRunner.query(`CREATE TABLE "payment_transfer" ("transferReference" character varying NOT NULL, "transferCode" character varying NOT NULL, "transferAmount" numeric NOT NULL, "status" "public"."payment_transfer_status_enum" NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "entityProfileId" bigint NOT NULL, CONSTRAINT "PK_ca59cbe8963f76e02d9483b6a76" PRIMARY KEY ("transferReference"))`);
        await queryRunner.query(`ALTER TABLE "entity_profile_bank_account_details" ADD CONSTRAINT "FK_3240b95a08da9c4a0d50e557ff7" FOREIGN KEY ("entityProfileId") REFERENCES "entity_profile"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "payment_transfer" ADD CONSTRAINT "FK_0d4ebd21f740bdff7d473e6b37e" FOREIGN KEY ("entityProfileId") REFERENCES "entity_profile"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "payment_transfer" DROP CONSTRAINT "FK_0d4ebd21f740bdff7d473e6b37e"`);
        await queryRunner.query(`ALTER TABLE "entity_profile_bank_account_details" DROP CONSTRAINT "FK_3240b95a08da9c4a0d50e557ff7"`);
        await queryRunner.query(`DROP TABLE "payment_transfer"`);
        await queryRunner.query(`DROP TYPE "public"."payment_transfer_status_enum"`);
    }

}
