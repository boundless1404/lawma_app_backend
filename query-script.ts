import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import * as fs from 'fs';

// Load environment variables
dotenv.config();

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
  logging: false,
});

async function runQuery() {
  try {
    await dataSource.initialize();
    console.log('Database connected successfully');

    // First, let's check what tables exist
    const tablesQuery = `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `;

    const tables = await dataSource.query(tablesQuery);
    console.log(`\n=== Found ${tables.length} tables in database ===\n`);

    // Comment out detailed table inspection for faster execution
    console.log('Using billing_account table for balance calculation...\n');

    const query = `
      SELECT 
          COALESCE(ep.name, 'N/A') AS "Operator Name",
          COALESCE(lga.name, 'N/A') AS "Local Government Area",
          COALESCE(lw.name, 'N/A') AS "Ward",
          COALESCE(CONCAT(lga.name, ' - ', lw.name), 'N/A') AS "Area",
          COALESCE(ps.id::text, 'N/A') AS "Property Code",
          COALESCE(
              TRIM(CONCAT(
                  COALESCE(esp."firstName", ''), ' ',
                  COALESCE(esp."middleName", ''), ' ',
                  COALESCE(esp."lastName", '')
              )), 'N/A'
          ) AS "Customer Name",
          COALESCE(ps."streetNumber", 'N/A') AS "Street No.",
          COALESCE(s.name, 'N/A') AS "Street",
          COALESCE(pt.name, 'N/A') AS "Property Type",
          COALESCE(psu."propertyUnits"::text, '0') AS "Property Unit",
          COALESCE(pt."unitPrice"::text, '0.00') AS "Unit Price",
          COALESCE(
              (CAST(ba."totalBillings" AS NUMERIC) - CAST(ba."totalPayments" AS NUMERIC)), 0
          ) AS "Balance"
      FROM property_subscription ps
          LEFT JOIN entity_subscriber_profile esp ON ps."entitySubscriberProfileId" = esp.id
          LEFT JOIN street s ON ps."streetId" = s.id
          LEFT JOIN lga_ward lw ON s."lgaWardId" = lw.id
          LEFT JOIN lga ON lw."lgaId" = lga.id
          LEFT JOIN entity_profile ep ON ps."entityProfileId" = ep.id
          LEFT JOIN property_subscription_unit psu ON ps.id = psu."propertySubscriptionId"
          LEFT JOIN entity_subscriber_property espr ON psu."entiySubscriberPropertyId" = espr.id
          LEFT JOIN property_type pt ON espr."propertyTypeId" = pt.id
          LEFT JOIN billing_account ba ON ps.id = ba."propertySubscriptionId"
      WHERE ps."deletedAt" IS NULL
      ORDER BY 
          COALESCE(ep.name, 'N/A'),
          COALESCE(lga.name, 'N/A'),
          COALESCE(lw.name, 'N/A'),
          COALESCE(esp."lastName", 'N/A'),
          COALESCE(esp."firstName", 'N/A');
    `;

    console.log(
      '🔍 Executing query to get all records using billing_account...',
    );
    const result = await dataSource.query(query);

    console.log(`\n✅ Found ${result.length} total records ===\n`);

    // Convert results to CSV
    if (result.length > 0) {
      const headers = Object.keys(result[0]);
      const csvHeaders = headers.join(',');

      const csvRows = result.map((row) => {
        return headers
          .map((header) => {
            const value = row[header];
            // Escape commas and quotes in CSV values
            if (
              typeof value === 'string' &&
              (value.includes(',') ||
                value.includes('"') ||
                value.includes('\n'))
            ) {
              return `"${value.replace(/"/g, '""')}"`;
            }
            return value;
          })
          .join(',');
      });

      const csvContent = [csvHeaders, ...csvRows].join('\n');

      // Write to CSV file with billing_account in filename
      const filename = `property_records_billing_account_${
        new Date().toISOString().split('T')[0]
      }.csv`;
      fs.writeFileSync(filename, csvContent);

      console.log(`✅ CSV file created: ${filename}`);
      console.log(`📊 Total records exported: ${result.length}`);

      // Show first 3 records as preview
      console.log('\n=== Preview (First 3 Records) ===\n');
      console.table(result.slice(0, 3));
    } else {
      console.log('No records found');
    }
  } catch (error) {
    console.error('Error running query:', error);
  } finally {
    await dataSource.destroy();
  }
}

runQuery();
