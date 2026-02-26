const { Pool } = require('pg');

const pool = new Pool({
  host: 'boundless-db.cdsesiyq6d5c.eu-north-1.rds.amazonaws.com',
  user: 'postgres',
  password: 'awsboundlessdb',
  database: 'lawma_app_db',
  port: 5432,
  ssl: {
    rejectUnauthorized: false
  }
});

async function runMigration() {
  const client = await pool.connect();
  try {
    console.log('Connected to database');
    
    // Step 1: Add is_duplicate column
    console.log('Step 1: Adding is_duplicate column...');
    await client.query(`
      ALTER TABLE "billing" 
      ADD COLUMN IF NOT EXISTS "is_duplicate" BOOLEAN DEFAULT FALSE;
    `);
    console.log('✓ Column added');
    
    // Step 2: Mark duplicates
    console.log('Step 2: Marking duplicate billings...');
    const markResult = await client.query(`
      WITH ranked_billings AS (
        SELECT 
          id,
          ROW_NUMBER() OVER (
            PARTITION BY "propertySubscriptionId", month, year 
            ORDER BY "createdAt" ASC, id ASC
          ) as rn
        FROM billing
      )
      UPDATE billing
      SET "is_duplicate" = TRUE
      WHERE id IN (
        SELECT id FROM ranked_billings WHERE rn > 1
      );
    `);
    console.log(`✓ Marked ${markResult.rowCount} duplicate billings`);
    
    // Step 3: Create unique index
    console.log('Step 3: Creating unique partial index...');
    await client.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "idx_unique_billing_per_property_month_year"
      ON "billing" ("propertySubscriptionId", month, year)
      WHERE "is_duplicate" = FALSE OR "is_duplicate" IS NULL;
    `);
    console.log('✓ Unique index created');
    
    // Step 4: Show summary
    const countResult = await client.query(`
      SELECT COUNT(*) as duplicate_count
      FROM billing
      WHERE "is_duplicate" = TRUE;
    `);
    console.log(`\n=== Migration Summary ===`);
    console.log(`Total duplicate billings marked: ${countResult.rows[0].duplicate_count}`);
    console.log('Migration completed successfully!');
    
  } catch (error) {
    console.error('Migration error:', error.message);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

runMigration()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
