import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateNotificationQueueTable1761479900000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create enum for notification type
    await queryRunner.query(`
            CREATE TYPE "public"."notification_queue_type_enum" AS ENUM('BILLING_GENERATED', 'PAYMENT_RECEIVED', 'PAYMENT_CONFIRMED')
        `);

    // Create enum for notification channel
    await queryRunner.query(`
            CREATE TYPE "public"."notification_queue_channel_enum" AS ENUM('SMS', 'EMAIL', 'BOTH')
        `);

    // Create enum for notification status
    await queryRunner.query(`
            CREATE TYPE "public"."notification_queue_status_enum" AS ENUM('PENDING', 'SENT', 'FAILED')
        `);

    // Create notification_queue table
    await queryRunner.query(`
            CREATE TABLE "notification_queue" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "type" "public"."notification_queue_type_enum" NOT NULL,
                "channel" "public"."notification_queue_channel_enum" NOT NULL,
                "status" "public"."notification_queue_status_enum" NOT NULL DEFAULT 'PENDING',
                "entityProfileId" bigint NOT NULL,
                "recipientPhone" character varying,
                "recipientEmail" character varying,
                "recipientName" character varying NOT NULL,
                "message" text NOT NULL,
                "metadata" jsonb,
                "errorMessage" text,
                "retryCount" integer NOT NULL DEFAULT 0,
                "smsUnitDeducted" boolean NOT NULL DEFAULT false,
                "sentAt" timestamp,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_notification_queue" PRIMARY KEY ("id")
            )
        `);

    // Create indexes for better query performance
    await queryRunner.query(`
            CREATE INDEX "IDX_notification_queue_status" 
            ON "notification_queue"("status")
        `);

    await queryRunner.query(`
            CREATE INDEX "IDX_notification_queue_type" 
            ON "notification_queue"("type")
        `);

    await queryRunner.query(`
            CREATE INDEX "IDX_notification_queue_entity_profile" 
            ON "notification_queue"("entityProfileId")
        `);

    await queryRunner.query(`
            CREATE INDEX "IDX_notification_queue_created_at" 
            ON "notification_queue"("createdAt")
        `);

    // Add foreign key constraint
    await queryRunner.query(`
            ALTER TABLE "notification_queue" 
            ADD CONSTRAINT "FK_notification_queue_entity_profile" 
            FOREIGN KEY ("entityProfileId") 
            REFERENCES "entity_profile"("id") 
            ON DELETE CASCADE
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove foreign key constraint
    await queryRunner.query(`
            ALTER TABLE "notification_queue" 
            DROP CONSTRAINT IF EXISTS "FK_notification_queue_entity_profile"
        `);

    // Drop indexes
    await queryRunner.query(`
            DROP INDEX IF EXISTS "IDX_notification_queue_created_at"
        `);

    await queryRunner.query(`
            DROP INDEX IF EXISTS "IDX_notification_queue_entity_profile"
        `);

    await queryRunner.query(`
            DROP INDEX IF EXISTS "IDX_notification_queue_type"
        `);

    await queryRunner.query(`
            DROP INDEX IF EXISTS "IDX_notification_queue_status"
        `);

    // Drop table
    await queryRunner.query(`DROP TABLE IF EXISTS "notification_queue"`);

    // Drop enums
    await queryRunner.query(
      `DROP TYPE IF EXISTS "public"."notification_queue_status_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE IF EXISTS "public"."notification_queue_channel_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE IF EXISTS "public"."notification_queue_type_enum"`,
    );
  }
}
