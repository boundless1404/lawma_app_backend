import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateRbacTables1704067200000 implements MigrationInterface {
  name = 'CreateRbacTables1704067200000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create permission category enum first
    await queryRunner.query(`
      CREATE TYPE "public"."permission_category_enum" AS ENUM(
        'user_management',
        'billing',
        'property_management',
        'payments',
        'reports',
        'system_settings',
        'notifications'
      )
    `);

    // Create permission action enum
    await queryRunner.query(`
      CREATE TYPE "public"."permission_action_enum" AS ENUM(
        'create',
        'read',
        'update',
        'delete',
        'approve',
        'export',
        'import'
      )
    `);

    // Create permissions table (after enums are created)
    await queryRunner.query(`
      CREATE TABLE "permission" (
        "id" BIGSERIAL NOT NULL,
        "name" character varying NOT NULL,
        "displayName" character varying NOT NULL,
        "description" character varying,
        "category" "public"."permission_category_enum" NOT NULL,
        "action" "public"."permission_action_enum" NOT NULL,
        "resource" character varying,
        "isActive" boolean NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_permission_name" UNIQUE ("name"),
        CONSTRAINT "PK_permission" PRIMARY KEY ("id")
      )
    `);

    // Create roles table
    await queryRunner.query(`
      CREATE TABLE "role" (
        "id" BIGSERIAL NOT NULL,
        "name" character varying NOT NULL,
        "description" character varying,
        "displayName" character varying,
        "isActive" boolean NOT NULL DEFAULT true,
        "isSystemRole" boolean NOT NULL DEFAULT false,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "entityProfileId" bigint NOT NULL,
        CONSTRAINT "UQ_role_name" UNIQUE ("name"),
        CONSTRAINT "PK_role" PRIMARY KEY ("id")
      )
    `);

    // Create role_permissions junction table
    await queryRunner.query(`
      CREATE TABLE "role_permissions" (
        "roleId" bigint NOT NULL,
        "permissionId" bigint NOT NULL,
        CONSTRAINT "PK_role_permissions" PRIMARY KEY ("roleId", "permissionId")
      )
    `);

    // Create user_role table
    await queryRunner.query(`
      CREATE TABLE "user_role" (
        "id" BIGSERIAL NOT NULL,
        "isActive" boolean NOT NULL DEFAULT true,
        "expiryDate" TIMESTAMP WITH TIME ZONE,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "roleId" bigint NOT NULL,
        "entityUserProfileId" bigint,
        "entitySubscriberProfileId" bigint,
        "assignedByUserId" bigint NOT NULL,
        CONSTRAINT "PK_user_role" PRIMARY KEY ("id")
      )
    `);

    // Add foreign key constraints
    await queryRunner.query(`
      ALTER TABLE "role" ADD CONSTRAINT "FK_role_entityProfile" 
      FOREIGN KEY ("entityProfileId") REFERENCES "entity_profile"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "role_permissions" ADD CONSTRAINT "FK_role_permissions_role" 
      FOREIGN KEY ("roleId") REFERENCES "role"("id") ON DELETE CASCADE ON UPDATE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "role_permissions" ADD CONSTRAINT "FK_role_permissions_permission" 
      FOREIGN KEY ("permissionId") REFERENCES "permission"("id") ON DELETE CASCADE ON UPDATE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "user_role" ADD CONSTRAINT "FK_user_role_role" 
      FOREIGN KEY ("roleId") REFERENCES "role"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "user_role" ADD CONSTRAINT "FK_user_role_entityUserProfile" 
      FOREIGN KEY ("entityUserProfileId") REFERENCES "entity_user_profile"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "user_role" ADD CONSTRAINT "FK_user_role_entitySubscriberProfile" 
      FOREIGN KEY ("entitySubscriberProfileId") REFERENCES "entity_subscriber_profile"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
    `);

    // Create indexes for better performance
    await queryRunner.query(`
      CREATE INDEX "IDX_permission_category" ON "permission" ("category")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_permission_action" ON "permission" ("action")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_role_entityProfileId" ON "role" ("entityProfileId")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_user_role_entityUserProfileId" ON "user_role" ("entityUserProfileId")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_user_role_entitySubscriberProfileId" ON "user_role" ("entitySubscriberProfileId")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_user_role_roleId" ON "user_role" ("roleId")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.query(`DROP INDEX "IDX_user_role_roleId"`);
    await queryRunner.query(
      `DROP INDEX "IDX_user_role_entitySubscriberProfileId"`,
    );
    await queryRunner.query(`DROP INDEX "IDX_user_role_entityUserProfileId"`);
    await queryRunner.query(`DROP INDEX "IDX_role_entityProfileId"`);
    await queryRunner.query(`DROP INDEX "IDX_permission_action"`);
    await queryRunner.query(`DROP INDEX "IDX_permission_category"`);

    // Drop foreign key constraints
    await queryRunner.query(
      `ALTER TABLE "user_role" DROP CONSTRAINT "FK_user_role_entitySubscriberProfile"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_role" DROP CONSTRAINT "FK_user_role_entityUserProfile"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_role" DROP CONSTRAINT "FK_user_role_role"`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions" DROP CONSTRAINT "FK_role_permissions_permission"`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions" DROP CONSTRAINT "FK_role_permissions_role"`,
    );
    await queryRunner.query(
      `ALTER TABLE "role" DROP CONSTRAINT "FK_role_entityProfile"`,
    );

    // Drop tables
    await queryRunner.query(`DROP TABLE "user_role"`);
    await queryRunner.query(`DROP TABLE "role_permissions"`);
    await queryRunner.query(`DROP TABLE "role"`);
    await queryRunner.query(`DROP TABLE "permission"`);

    // Drop enums
    await queryRunner.query(`DROP TYPE "public"."permission_action_enum"`);
    await queryRunner.query(`DROP TYPE "public"."permission_category_enum"`);
  }
}
