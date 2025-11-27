import { MigrationInterface, QueryRunner } from 'typeorm';

export class CleanupDuplicateStreets1730700000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Log start of migration
    console.log('Starting duplicate streets cleanup...');

    // Step 1: Create a temporary mapping table
    // This table maps each street ID to its "canonical" version
    // For duplicate streets (same name + entityProfileId), we pick the oldest ID
    await queryRunner.query(`
      CREATE TEMP TABLE street_mapping AS
      SELECT 
        id as old_id,
        FIRST_VALUE(id) OVER (
          PARTITION BY UPPER(TRIM(name)), "entityProfileId" 
          ORDER BY id ASC
        ) as new_id,
        UPPER(TRIM(name)) as normalized_name,
        "entityProfileId"
      FROM public.street;
    `);

    // Log how many duplicates we found
    const duplicateCount = await queryRunner.query(`
      SELECT COUNT(*) as count 
      FROM street_mapping 
      WHERE old_id != new_id;
    `);
    console.log(
      `Found ${duplicateCount[0].count} duplicate street records to merge`,
    );

    // Step 2: Update property_subscription to point to canonical streets
    // This ensures no property references will be lost when we delete duplicates
    const updateResult = await queryRunner.query(`
      UPDATE public.property_subscription ps
      SET "streetId" = sm.new_id
      FROM street_mapping sm
      WHERE ps."streetId" = sm.old_id
        AND sm.old_id != sm.new_id;
    `);
    console.log(
      `Updated ${updateResult[1]} property subscriptions to use canonical streets`,
    );

    // Step 3: Delete duplicate streets (keeping only the canonical ones)
    const deleteResult = await queryRunner.query(`
      DELETE FROM public.street s
      USING street_mapping sm
      WHERE s.id = sm.old_id
        AND sm.old_id != sm.new_id;
    `);
    console.log(`Deleted ${deleteResult[1]} duplicate street records`);

    // Step 4: Normalize all remaining street names to uppercase
    // This ensures consistent formatting going forward
    await queryRunner.query(`
      UPDATE public.street
      SET name = UPPER(TRIM(name));
    `);
    console.log('Normalized all street names to uppercase');

    // Step 5: Add unique constraint to prevent future duplicates
    // Uses a function-based unique index for case-insensitive uniqueness
    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "UQ_street_name_entity" 
      ON public.street (UPPER(name), "entityProfileId");
    `);
    console.log('Added unique constraint to prevent future duplicates');

    console.log('Duplicate streets cleanup completed successfully!');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove the unique constraint
    await queryRunner.query(`
      DROP INDEX IF EXISTS "UQ_street_name_entity";
    `);

    console.log('Removed unique constraint on streets');

    // Note: We cannot restore deleted duplicate streets
    // The data has been permanently merged into canonical records
    console.warn(
      'WARNING: Cannot restore deleted duplicate streets. This migration is not fully reversible.',
    );
  }
}
