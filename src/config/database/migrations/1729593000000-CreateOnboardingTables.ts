import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateOnboardingTables1729593000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create waste_operators table
    await queryRunner.query(`
      CREATE TABLE "waste_operators" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "companyName" varchar NOT NULL,
        "contactPersonName" varchar NOT NULL,
        "email" varchar NOT NULL,
        "phoneNumber" varchar NOT NULL,
        "areaOfOperation" varchar,
        "registrationNumber" varchar,
        "isActive" boolean NOT NULL DEFAULT true,
        "motherShipUserId" varchar,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_waste_operators_email" UNIQUE ("email"),
        CONSTRAINT "UQ_waste_operators_companyName" UNIQUE ("companyName")
      )
    `);

    // Create property_enumerations table
    await queryRunner.query(`
      CREATE TABLE "property_enumerations" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "customerCode" varchar NOT NULL,
        "houseNo" varchar NOT NULL,
        "street" varchar NOT NULL,
        "name" varchar NOT NULL,
        "lga" varchar NOT NULL,
        "ward" varchar NOT NULL,
        "zone" varchar,
        "phoneNumber" varchar,
        "outstandingBalance" decimal(10,2) NOT NULL,
        "totalAmount" decimal(10,2) NOT NULL,
        "wasteOperatorId" uuid NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "FK_property_enumerations_wasteOperatorId" 
          FOREIGN KEY ("wasteOperatorId") REFERENCES "waste_operators"("id") ON DELETE CASCADE
      )
    `);

    // Create property_data table
    await queryRunner.query(`
      CREATE TABLE "property_data" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "propertyType" varchar NOT NULL,
        "units" integer NOT NULL,
        "rate" decimal(10,2) NOT NULL,
        "totalAmount" decimal(10,2) NOT NULL,
        "propertyEnumerationId" uuid NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "FK_property_data_propertyEnumerationId" 
          FOREIGN KEY ("propertyEnumerationId") REFERENCES "property_enumerations"("id") ON DELETE CASCADE
      )
    `);

    // Create indices for better performance
    await queryRunner.query(`
      CREATE INDEX "IDX_property_enumerations_wasteOperatorId" ON "property_enumerations" ("wasteOperatorId")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_property_enumerations_customerCode" ON "property_enumerations" ("customerCode")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_property_data_propertyEnumerationId" ON "property_data" ("propertyEnumerationId")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop tables in reverse order (due to foreign key constraints)
    await queryRunner.query(`DROP TABLE "property_data"`);
    await queryRunner.query(`DROP TABLE "property_enumerations"`);
    await queryRunner.query(`DROP TABLE "waste_operators"`);
  }
}
