import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateNotificationEntity1752418531024
  implements MigrationInterface
{
  name = 'CreateNotificationEntity1752418531024';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."notification_type_enum" AS ENUM('invoice', 'payment', 'alert', 'update', 'system')`,
    );
    await queryRunner.query(
      `CREATE TABLE "notification" ("id" BIGSERIAL NOT NULL, "title" character varying(255) NOT NULL, "description" text NOT NULL, "type" "public"."notification_type_enum" NOT NULL DEFAULT 'system', "isRead" boolean NOT NULL DEFAULT false, "actionText" character varying(100), "actionUrl" character varying(500), "imageUrl" character varying(500), "relatedEntityId" character varying(50), "relatedEntityType" character varying(50), "entityProfileId" bigint NOT NULL, "propertySubscriptionId" bigint NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_705b6c7cdf9b2c2ff7ac7872cb7" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_c54c1f5d22686e11546f6beaf5" ON "notification" ("entityProfileId", "isRead") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_0dbffa30ba27c754b7e3f662a4" ON "notification" ("entityProfileId", "createdAt") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_88d226d4edf3a2286edc364a1a" ON "notification" ("propertySubscriptionId", "isRead") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_8735f447f19233132d440852d4" ON "notification" ("propertySubscriptionId", "createdAt") `,
    );
    await queryRunner.query(
      `ALTER TABLE "notification" ADD CONSTRAINT "FK_f5b863e969d0703b0f25b8fdb8d" FOREIGN KEY ("entityProfileId") REFERENCES "entity_profile"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "notification" ADD CONSTRAINT "FK_6b70b3c87ca5c078ae4d7804d79" FOREIGN KEY ("propertySubscriptionId") REFERENCES "property_subscription"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "notification" DROP CONSTRAINT "FK_6b70b3c87ca5c078ae4d7804d79"`,
    );
    await queryRunner.query(
      `ALTER TABLE "notification" DROP CONSTRAINT "FK_f5b863e969d0703b0f25b8fdb8d"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_8735f447f19233132d440852d4"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_88d226d4edf3a2286edc364a1a"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_0dbffa30ba27c754b7e3f662a4"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_c54c1f5d22686e11546f6beaf5"`,
    );
    await queryRunner.query(`DROP TABLE "notification"`);
    await queryRunner.query(`DROP TYPE "public"."notification_type_enum"`);
  }
}
