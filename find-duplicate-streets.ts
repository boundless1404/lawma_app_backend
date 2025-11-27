import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config();

async function findDuplicateStreets() {
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST,
    port: 5432,
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: {
      rejectUnauthorized: false,
    },
  });

  try {
    await dataSource.initialize();
    console.log('✓ Connected to database\n');

    // Find duplicate streets
    const duplicates = await dataSource.query(`
      SELECT 
        UPPER(TRIM(name)) as normalized_name,
        "entityProfileId",
        COUNT(*) as duplicate_count,
        ARRAY_AGG(id ORDER BY id) as street_ids,
        ARRAY_AGG(name ORDER BY id) as original_names
      FROM public.street
      GROUP BY UPPER(TRIM(name)), "entityProfileId"
      HAVING COUNT(*) > 1
      ORDER BY COUNT(*) DESC, normalized_name;
    `);

    console.log(`Found ${duplicates.length} sets of duplicate streets:\n`);
    console.log('═══════════════════════════════════════════════════════════');

    let totalDuplicates = 0;
    for (const dup of duplicates) {
      const keepId = dup.street_ids[0];
      const deleteIds = dup.street_ids.slice(1);

      console.log(`\n📍 Street: "${dup.normalized_name}"`);
      console.log(`   Operator ID: ${dup.entityProfileId}`);
      console.log(`   Total occurrences: ${dup.duplicate_count}`);
      console.log(`   ✓ Will KEEP ID: ${keepId} ("${dup.original_names[0]}")`);
      console.log(
        `   ✗ Will DELETE IDs: ${deleteIds.join(', ')} (${deleteIds.length} duplicates)`,
      );

      // Show variations in naming
      const uniqueNames = [...new Set(dup.original_names)];
      if (uniqueNames.length > 1) {
        console.log(`   📝 Name variations found:`);
        uniqueNames.forEach((name) => console.log(`      - "${name}"`));
      }

      totalDuplicates += dup.duplicate_count - 1;
    }

    console.log('\n═══════════════════════════════════════════════════════════');
    console.log(`\n📊 Summary:`);
    console.log(`   - ${duplicates.length} unique streets have duplicates`);
    console.log(`   - ${totalDuplicates} duplicate records will be removed`);
    console.log(
      `   - ${duplicates.length} canonical records will be preserved\n`,
    );

    // Check how many property subscriptions will be affected
    const affectedProperties = await dataSource.query(`
      SELECT COUNT(*) as count
      FROM public.property_subscription ps
      WHERE ps."streetId" IN (
        SELECT s.id
        FROM public.street s
        WHERE (UPPER(TRIM(s.name)), s."entityProfileId") IN (
          SELECT UPPER(TRIM(name)), "entityProfileId"
          FROM public.street
          GROUP BY UPPER(TRIM(name)), "entityProfileId"
          HAVING COUNT(*) > 1
        )
      );
    `);

    console.log(
      `⚠️  ${affectedProperties[0].count} property subscriptions reference duplicate streets`,
    );
    console.log(
      `   (These will be automatically updated to use canonical streets)\n`,
    );
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await dataSource.destroy();
  }
}

findDuplicateStreets();
