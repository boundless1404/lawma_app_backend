import { MigrationInterface, QueryRunner } from "typeorm";

export class Sh1734125435342 implements MigrationInterface {
    name = 'Sh1734125435342'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."pending_wallet_transaction_type_enum" AS ENUM('credit', 'debit')`);
        await queryRunner.query(`CREATE TABLE "pending_wallet_transaction" ("id" BIGSERIAL NOT NULL, "walletReference" character varying NOT NULL, "sourcePaymentReference" character varying, "amount" numeric NOT NULL, "userId" bigint NOT NULL, "creditSourceData" character varying NOT NULL, "type" "public"."pending_wallet_transaction_type_enum" NOT NULL, CONSTRAINT "PK_59a58ed193aea7354a4365801ed" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "pending_wallet_transaction"`);
        await queryRunner.query(`DROP TYPE "public"."pending_wallet_transaction_type_enum"`);
    }

}
